import { readdirSync } from 'fs';
import { resolve } from 'path';
import { EventEmitter } from 'stream';
import { Channel, Connection, Message, connect } from 'amqplib';
import { randomInt, randomUUID } from 'crypto';

import { Job } from '@/job/protocols';
import { jobAdapter } from '@/main/adapters';
import {
  amqpLogger,
  CONSUMER,
  convertCamelCaseKeysToSnakeCase,
  convertSnakeCaseKeysToCamelCase,
  RABBIT
} from '@/util';
import { logger } from '@/util/observability';
import { apmSpan, apmTransaction } from '@/util/observability/apm';
import { logger as loggerDecorator } from '@/util/observability/loggers/decorators';

import {
  Consumer,
  ConsumerCallback,
  Credentials,
  Payload,
  ConsumerOptions
} from './types';

export class RabbitMqServer {
  private connection: Connection | null = null;
  private channelPoolLength = 3;
  private channelPool: Map<string, Channel> = new Map();

  private consumers: Map<string, { channel: Channel; consumer: Consumer }> =
    new Map();

  private messages: Set<Message> = new Set();
  private url!: string;

  private defaultPrefetch: number | undefined = undefined;

  private queueLoaderOptions: {
    allowAll: boolean;
    denyAll: boolean;
    deny: string[];
    allow: string[];
  } = {
    allowAll: false,
    denyAll: false,
    deny: [],
    allow: []
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private optionsFromEnv: Record<string, any> | null = null;

  private thereIsAPendingRestart = false;
  private closing = false;

  public Error = {
    CredentialsNotDefined:
      'Credentials not defined, use setCredentials to define credentials',
    InvalidCredentialFieldValue: (field: string) =>
      `Invalid value for (${field}) field`,
    InvalidPrefetchValue: 'Prefetch must be a number',
    ConnectionNotDefined:
      'The connection has not been defined, you must start a connection before continuing',
    EmptyChannelPool:
      'The channel pool is empty; for the class to work properly, the channel pool must have at least one channel '
  };

  private event = new EventEmitter();

  private events = {
    RESTART: Symbol('RESTART'),
    ACK: Symbol('ACK'),
    CHECK_CHANNEL_POOL: Symbol('CHECK_CHANNEL_POOL'),
    REBUILD_CONSUMER: Symbol('REBUILD_CONSUMER')
  };

  private static instance: RabbitMqServer;

  constructor(private credentials: Credentials | null = null) {
    if (this.credentials) this.setCredentials(this.credentials);

    if (RABBIT.DEFAULT_PREFETCH) {
      this.defaultPrefetch = RABBIT.DEFAULT_PREFETCH;
    }

    this.extractQueueOptions();
    this.loadOptionsFromEnv();
  }

  public static getInstance(): RabbitMqServer {
    if (!RabbitMqServer.instance) {
      RabbitMqServer.instance = new RabbitMqServer();
    }

    return RabbitMqServer.instance;
  }

  private logger(error: Error): void;
  private logger(args: {
    level: string;
    message: string;
    payload?: Record<string, unknown>;
  }): void;
  private logger(
    args: Error & {
      level: string;
      message: string;
      payload?: Record<string, unknown>;
    }
  ) {
    logger.log(args);
  }

  private loadOptionsFromEnv() {
    if (typeof process.env.RABBIT_OPTIONS !== 'string') return;

    this.optionsFromEnv = this.parseOptionsFromString(
      process.env.RABBIT_OPTIONS
    );
  }

  public setCredentials(credentials: Credentials) {
    Object.entries(credentials).forEach(([key, value]) => {
      if (value === undefined)
        throw new Error(this.Error.InvalidCredentialFieldValue(key));
    });

    const virtualHost = credentials.virtualHost
      ? `/${credentials.virtualHost}`
      : '';

    this.url = `amqp://${credentials.user}:${credentials.password}@${credentials.host}:${credentials.port}${virtualHost}`;
    return this;
  }

  public async start() {
    this.logger({ level: 'info', message: 'Starting connection' });
    if (!this.connection) {
      if (!this.url) throw new Error(this.Error.CredentialsNotDefined);
      this.connection = await connect(this.url);
    }

    await this.createChannelPool(this.channelPoolLength);

    if (this.channelPool.size === 0) {
      throw new Error(this.Error.EmptyChannelPool);
    }

    this.startEventLiveners();

    this.logger({ level: 'info', message: 'Connection started' });

    return this;
  }

  private async waitForPendingProcessing() {
    const CHECK_INTERVAL = 100;
    let interval;

    await new Promise((resolve) => {
      interval = setInterval(() => {
        if (this.messages.size === 0) {
          resolve(null);
        }
      }, CHECK_INTERVAL);
    });

    clearInterval(interval);
  }

  public async stop() {
    this.logger({ level: 'info', message: 'Closing connection' });

    if (this.closing) {
      return;
    }

    this.closing = true;

    await this.waitForPendingProcessing();

    this.connection?.removeAllListeners();
    this.event.removeAllListeners();

    if (this.connection) {
      try {
        await this.connection.close();
      } catch (error) {
        this.logger(error);
      }

      this.closing = false;
    }

    this.connection = null;

    this.logger({ level: 'info', message: 'Connection closed' });

    return this;
  }

  public getPendingMessageCount(): number {
    return this.messages.size;
  }

  public async cancelConsumers() {
    this.logger({ level: 'info', message: 'Closing consumers' });

    const consumers = Array.from(this.consumers);

    const promises = consumers.map(async ([key, value]) => {
      try {
        this.consumers.delete(key);
        await value.channel.cancel(key);
        await value.channel.close();
      } catch (error) {
        this.logger(error);
      }
    });

    await Promise.allSettled(promises);
    this.logger({
      level: 'info',
      message: 'All consumer are closed'
    });
  }

  public async restart() {
    const RESTAR_TIMEOUT = 1500;
    this.logger({ level: 'info', message: 'Restart event' });
    if (this.thereIsAPendingRestart) return;
    this.logger({ level: 'info', message: 'Restart event accepted' });
    this.thereIsAPendingRestart = true;

    try {
      await this.stop();
      await this.start();
    } catch (error) {
      this.logger({ level: 'info', message: 'Error when restarting' });
      this.logger(error);
      this.thereIsAPendingRestart = false;
      this.event.emit(this.events.RESTART);
      return;
    }

    await this.rebuildConsumers(false);

    setTimeout(() => {
      this.thereIsAPendingRestart = false;
    }, RESTAR_TIMEOUT);

    return this;
  }

  @loggerDecorator({
    options: { name: 'Publish message in queue', subType: 'rabbitmq' },
    input: { queue: 0, message: 1, headers: 2 }
  })
  @apmSpan({
    options: { name: 'Publish message in queue', subType: 'rabbitmq' },
    params: { queue: 0, message: 1, headers: 2 }
  })
  public async publishInQueue(queue: string, message: object, headers: object) {
    if (!this.connection) {
      this.logger({
        level: 'error',
        message: 'Unable to publish message, connection not defined',
        payload: { queue, message, headers }
      });
      throw new Error(this.Error.ConnectionNotDefined);
    }

    if (this.channelPool.size === 0) {
      this.logger({
        level: 'error',
        message: 'Unable to publish message, empty channel pool',
        payload: { queue, message, headers }
      });
      throw new Error(this.Error.EmptyChannelPool);
    }

    const chanelIndex = randomInt(0, this.channelPool.size - 1);

    const buffer = this.convertMessageToBuffer(
      convertCamelCaseKeysToSnakeCase(message)
    );

    const channelList = Array.from(this.channelPool).map(([, value]) => value);

    return channelList[chanelIndex].sendToQueue(queue, buffer, {
      headers
    });
  }
  @loggerDecorator({
    options: { name: 'Publish message in exchange', subType: 'rabbitmq' },
    input: { exchange: 0, message: 1, routingKey: 2, headers: 3 }
  })
  @apmSpan({
    options: { name: 'Publish message in exchange', subType: 'rabbitmq' },
    params: { exchange: 0, message: 1, routingKey: 2, headers: 3 }
  })
  public async publishInExchange(
    exchange: string,
    message: object,
    routingKey: string,
    headers?: object
  ) {
    if (!this.connection) {
      this.logger({
        level: 'error',
        message: 'Unable to publish message, connection not defined',
        payload: { exchange, message, routingKey, headers }
      });
      throw new Error(this.Error.ConnectionNotDefined);
    }

    if (this.channelPool.size === 0) {
      this.logger({
        level: 'error',
        message: 'Unable to publish message, empty channel pool',
        payload: { exchange, message, routingKey, headers }
      });
      throw new Error(this.Error.EmptyChannelPool);
    }

    const buffer = this.convertMessageToBuffer(
      convertCamelCaseKeysToSnakeCase(message)
    );

    const chanelIndex = randomInt(0, this.channelPool.size - 1);

    const channelList = Array.from(this.channelPool).map(([, value]) => value);

    return channelList[chanelIndex].publish(exchange, routingKey, buffer, {
      headers
    });
  }

  public async consume(
    queue: string,
    callback: ConsumerCallback,
    options?: { prefetch?: number }
  ) {
    try {
      if (!this.connection) {
        throw new Error(this.Error.ConnectionNotDefined);
      }

      const channel = await this.connection.createChannel();

      if (options?.prefetch) {
        await channel.prefetch(options.prefetch);
      }

      const consumer = await channel.consume(queue, async (message) => {
        if (!message) return;

        try {
          if (this.closing) this.reject(message);

          this.messages.add(message);

          this.setCustomMessageProperties(message, { rejected: false });

          const payload = {
            body: convertSnakeCaseKeysToCamelCase(
              this.convertMessageToJson(message)
            ),
            headers: message.properties.headers,
            fields: { queue, ...message.fields },
            properties: message.properties,
            reject: (requeue?: boolean) => {
              this.reject(message, requeue ?? true);
            }
          };

          await this.transactionHandler(queue, payload, callback);
        } catch (error) {
          this.logger(error);
          if (error.stack.includes('at JSON.parse')) {
            this.logger({
              level: 'warn',
              message: 'Unable to convert message to JSON',
              payload: {
                message: message.content.toString(),
                headers: message.properties.headers,
                properties: { queue, ...message.fields }
              }
            });
          }
        } finally {
          this.logger({
            level: 'verbose',
            message: 'The message left the queue',
            payload: {
              message: message.content.toString(),
              headers: message.properties.headers,
              properties: { queue, ...message.fields }
            }
          });

          this.ack(message);
          this.messages.delete(message);
        }
      });

      channel.once('close', () => {
        const REBUILD_DELAY = 1_000;
        setTimeout(() => {
          this.event.emit(this.events.REBUILD_CONSUMER, consumer.consumerTag);
        }, REBUILD_DELAY);
      });

      channel.on('error', (error) => {
        this.logger(error);
      });

      if (!consumer) return;

      this.consumers.set(consumer.consumerTag, {
        channel,
        consumer: { queue, callback, options }
      });

      this.logger({
        level: 'info',
        message: `Consumer to ${queue} is online!`
      });
    } catch (error) {
      this.logger(error);
    }
  }

  public makeConsumer(queue: string, ...callbacks: (Job | Function)[]): void;
  public makeConsumer(
    options: ConsumerOptions,
    ...callbacks: (Job | Function)[]
  ): void;
  public makeConsumer(
    arg1: string | ConsumerOptions,
    ...callbacks: (Job | Function)[]
  ): void {
    let queue;
    let enabled = true;
    let prefetch;

    if (typeof arg1 === 'object') {
      queue = arg1.queue;
      enabled = this.optionsFromEnv?.[queue]?.enabled ?? !!arg1.enabled;

      prefetch =
        this.optionsFromEnv?.[queue]?.prefetch ??
        arg1?.prefetch ??
        this.defaultPrefetch;
    } else {
      queue = arg1;
    }

    const { allow, allowAll, deny, denyAll } = this.queueLoaderOptions;

    if (deny.includes(queue)) return;

    if (denyAll && !allow.includes(queue)) return;

    if (!enabled && !allowAll && !allow.includes(queue)) return;

    this.consume(queue, jobAdapter(...callbacks), { prefetch });
  }

  public async consumersDirectory(path: string): Promise<void> {
    const extensionsToSearch = ['.TS', '.JS'];
    const ignoreIfIncludes = ['.MAP.', '.SPEC.', '.TEST.'];

    const files = readdirSync(path);

    for await (const fileName of files) {
      const fileNameToUpperCase = fileName.toLocaleUpperCase();

      const hasAValidExtension = ignoreIfIncludes.map((text) =>
        fileNameToUpperCase.includes(text)
      );

      const haveAValidName = extensionsToSearch.map((ext) =>
        fileNameToUpperCase.endsWith(ext)
      );

      if (haveAValidName && hasAValidExtension) {
        const filePath = resolve(path, fileName);
        const setup = (await import(filePath)).default;

        if (typeof setup !== 'function') continue;

        setup(this);
      }
    }
  }

  private async createChannelPool(poolLength: number) {
    if (!this.connection) {
      throw new Error(this.Error.ConnectionNotDefined);
    }

    const chanelPromises = [];

    for (let index = 0; index < poolLength; index++) {
      const promise = this.connection.createChannel();
      chanelPromises.push(promise);
    }

    const pool = await Promise.allSettled(chanelPromises);

    for (const item of pool) {
      if (item.status === 'fulfilled') {
        const channelId = randomUUID();

        item.value.on('error', (error) => {
          this.logger(error);
        });

        item.value.once('close', () => {
          this.channelPool.delete(channelId);
          this.event.emit(this.events.CHECK_CHANNEL_POOL);
        });

        this.channelPool.set(channelId, item.value);
      }
    }
  }

  private setCustomMessageProperties(
    message: Message,
    properties: Record<string, unknown>
  ) {
    const typedMessage = <
      Message & { customProperties: Record<string, unknown> }
    >message;

    if (!typedMessage.customProperties) {
      typedMessage.customProperties = {};
    }

    for (const key in properties) {
      if (typeof key === 'string' || typeof key === 'number')
        typedMessage.customProperties[key] = properties[key];
    }
  }

  private getCustomMessageProperties(
    message: Message,
    property: string | number
  ) {
    const typedMessage = <
      Message & { customProperties: Record<string, unknown> }
    >message;

    const value = typedMessage.customProperties[property];
    return value ?? null;
  }

  private reject(message: Message, requeue?: boolean) {
    try {
      if (
        !this.connection ||
        this.getCustomMessageProperties(message, 'rejected') ||
        this.getCustomMessageProperties(message, 'acked')
      )
        return;

      this.setCustomMessageProperties(message, { rejected: true });

      const { consumerTag } = message.fields;

      if (!consumerTag) return;

      this.consumers.get(consumerTag)?.channel.reject(message, requeue);
    } catch (error) {
      this.logger(error);
      this.logger({
        level: 'warn',
        message: 'Unable to reject message',
        payload: { message: message.content.toString() }
      });
    }
  }

  private ack(message: Message) {
    try {
      if (
        !this.connection ||
        this.getCustomMessageProperties(message, 'rejected') ||
        this.getCustomMessageProperties(message, 'acked')
      )
        return;

      this.setCustomMessageProperties(message, { acked: true });

      const { consumerTag } = message.fields;

      if (!consumerTag) return;

      this.consumers.get(consumerTag)?.channel.ack(message);
    } catch (error) {
      this.logger(error);
      this.logger({
        level: 'warn',
        message: 'Unable to ack message',
        payload: { message: message.content.toString() }
      });
    }
  }

  private startEventLiveners() {
    this.connection?.on('error', (error) => {
      this.logger(error);
    });

    this.connection?.on('close', () => {
      if (!this.thereIsAPendingRestart) {
        this.event.emit(this.events.RESTART);
      }
    });

    this.event.on(this.events.RESTART, this.restart.bind(this));
    this.event.on(this.events.CHECK_CHANNEL_POOL, async () => {
      if (this.channelPool.size !== 0) return;

      await this.createChannelPool(this.channelPoolLength);
    });

    this.event.on(
      this.events.REBUILD_CONSUMER,
      this.rebuildConsumer.bind(this)
    );
  }

  private async rebuildConsumers(deleteConsumers = true) {
    this.logger({
      level: 'info',
      message: 'Starting rebuilding all consumers'
    });

    const consumers = Array.from(this.consumers);

    const promises = consumers.map(async ([key, value]) => {
      try {
        this.consumers.delete(key);
        if (deleteConsumers) {
          await value.channel.cancel(key);
          await value.channel.close();
        }
        return this.consume(
          value.consumer.queue,
          value.consumer.callback,
          value.consumer.options
        );
      } catch (error) {
        this.logger(error);
        return null;
      }
    });

    await Promise.allSettled(promises);

    this.logger({
      level: 'info',
      message: 'All consumers reconstruction completed'
    });
  }

  private async rebuildConsumer(consumerTag: string) {
    if (!this.connection) {
      throw new Error(this.Error.ConnectionNotDefined);
    }

    if (this.thereIsAPendingRestart || this.closing) return;

    this.logger({
      level: 'info',
      message: `Starting rebuilding consumer: ${consumerTag}`
    });

    const targetConsumer = this.consumers.get(consumerTag);

    if (!targetConsumer) {
      this.logger({
        level: 'warn',
        message: 'Unable to rebuild consumer, consumer not found',
        payload: { consumerTag }
      });
      return;
    }

    try {
      this.consumers.delete(consumerTag);
      await targetConsumer.channel.cancel(consumerTag);
      await targetConsumer.channel.close();

      const promise = this.consume(
        targetConsumer.consumer.queue,
        targetConsumer.consumer.callback,
        targetConsumer.consumer.options
      );

      this.logger({
        level: 'info',
        message: 'Consumer reconstruction completed'
      });

      return promise;
    } catch (error) {
      this.logger(error);
      return null;
    }
  }

  private convertMessageToBuffer(message: Record<string, unknown>): Buffer {
    const string = JSON.stringify(message);
    return Buffer.from(string);
  }

  private convertMessageToJson(message: Message): Record<string, unknown> {
    return JSON.parse(message.content.toString());
  }

  @amqpLogger({
    options: { nameByParameter: 0, subType: 'rabbitmq' },
    input: { message: 1 }
  })
  @apmTransaction({
    options: { nameByParameter: 0, type: 'rabbitmq' },
    params: { message: 1 }
  })
  private async transactionHandler(
    _queue: string,
    payload: Payload,
    callback: Function
  ): Promise<void> {
    const { body, headers, ...restOfPayload } = payload;
    const bodyAndHeadersToCamelCase = convertSnakeCaseKeysToCamelCase({
      body,
      headers
    });

    return callback({ ...bodyAndHeadersToCamelCase, ...restOfPayload });
  }

  private extractQueueOptions() {
    for (const item of CONSUMER.LIST) {
      if (item === '*') {
        this.queueLoaderOptions.allowAll = true;
        this.queueLoaderOptions.denyAll = false;
        continue;
      }
      if (item === '!*') {
        this.queueLoaderOptions.allowAll = false;
        this.queueLoaderOptions.denyAll = true;
        continue;
      }

      if (item[0] === '!') {
        this.queueLoaderOptions.deny.push(item.substring(1));
      } else {
        this.queueLoaderOptions.allow.push(item);
      }
    }
  }

  private parseOptionsFromString(
    stringOptions: string
  ): Record<string, unknown> {
    const options: Record<string, unknown> = {};

    function parseValue(value: string) {
      if (value.toLowerCase() === 'true') {
        return true;
      }
      if (value.toLowerCase() === 'false') {
        return false;
      }

      const numberValue = Number(value);

      if (!Number.isNaN(numberValue)) {
        return numberValue;
      }

      return value;
    }

    const keyValuePairs = stringOptions.split(',').map((item) => item.trim());

    for (const pair of keyValuePairs) {
      const [path, value] = pair.split('=').map((item) => item.trim());
      const pathParts = path.split('.');

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      pathParts.reduce((acc: any, part: string, index: number) => {
        if (index === pathParts.length - 1) {
          acc[part] = parseValue(value);

          return acc[part];
        }

        acc[part] = acc[part] || {};

        return acc[part];
      }, options);
    }

    return options;
  }
}
