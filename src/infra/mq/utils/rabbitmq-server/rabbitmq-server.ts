import { readdirSync } from 'fs';
import { resolve } from 'path';
import { EventEmitter } from 'stream';
import { Channel, Connection, Message, connect } from 'amqplib';

import { Job } from '@/job/protocols';
import { jobAdapter } from '@/main/adapters';
import {
  amqpLogger,
  convertCamelCaseKeysToSnakeCase,
  convertSnakeCaseKeysToCamelCase
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
  private channel: Channel | null = null;
  private consumers: Map<string, Consumer> = new Map();
  private uri!: string;
  private prefetch!: number;

  private thereIsAPendingRestart = false;
  private preventChannelRecover = false;
  private theChannelIsActive = false;

  public Error = {
    CredentialsNotDefined:
      'Credentials not defined, use setCredentials to define credentials',
    InvalidCredentialFieldValue: (field: string) =>
      `Invalid value for (${field}) field`,
    InvalidPrefetchValue: 'Prefetch must be a number'
  };

  private event = new EventEmitter();

  private events = { RESTART: Symbol('RESTART'), ACK: Symbol('ACK') };

  private static instance: RabbitMqServer;

  constructor(private credentials: Credentials | null = null) {
    if (this.credentials) this.setCredentials(this.credentials);
  }

  public static getInstance(): RabbitMqServer {
    if (!RabbitMqServer.instance) {
      RabbitMqServer.instance = new RabbitMqServer();
    }

    return RabbitMqServer.instance;
  }

  public setPrefetch(prefetch: number) {
    if (typeof prefetch !== 'number')
      throw new Error(this.Error.InvalidPrefetchValue);

    this.prefetch = prefetch;
    return this;
  }

  public setCredentials(credentials: Credentials) {
    Object.entries(credentials).forEach(([key, value]) => {
      if (value === undefined)
        throw new Error(this.Error.InvalidCredentialFieldValue(key));
    });

    const virtualHost = credentials.virtualHost
      ? `/${credentials.virtualHost}`
      : '';

    this.uri = `amqp://${credentials.user}:${credentials.password}@${credentials.host}:${credentials.port}${virtualHost}`;
    return this;
  }

  public async start() {
    logger.log({ level: 'info', message: 'Starting connection' });
    if (!this.connection) {
      if (!this.uri) throw new Error(this.Error.CredentialsNotDefined);
      this.connection = await connect(this.uri);
    }

    if (!this.channel) {
      this.channel = await this.connection.createChannel();
    }

    this.theChannelIsActive = true;

    if (typeof this.prefetch === 'number') {
      await this.channel.prefetch(this.prefetch);
    }

    this.startEventLiveners();

    logger.log({ level: 'info', message: 'Connection started' });

    return this;
  }

  public async close() {
    logger.log({ level: 'info', message: 'Closing connection' });

    this.channel?.removeAllListeners();
    this.connection?.removeAllListeners();
    this.event.removeAllListeners();

    this.preventChannelRecover = true;

    if (this.channel) {
      try {
        await this.channel.close();
      } catch (error) {
        logger.log(error);
      } finally {
        this.theChannelIsActive = false;
      }
    }

    if (this.connection) {
      try {
        await this.connection.close();
      } catch (error) {
        logger.log(error);
      }
    }

    this.channel = null;
    this.connection = null;

    logger.log({ level: 'info', message: 'Connection closed' });

    this.preventChannelRecover = false;

    return this;
  }

  public async restart() {
    logger.log({ level: 'info', message: 'Restart event' });
    if (this.thereIsAPendingRestart) return;
    logger.log({ level: 'info', message: 'Restart event accepted' });
    this.thereIsAPendingRestart = true;

    try {
      await this.close();
      await this.start();
    } catch (error) {
      logger.log({ level: 'info', message: 'Error when restarting' });
      logger.log(error);
      this.thereIsAPendingRestart = false;
      this.event.emit(this.events.RESTART);
    }

    await this.rebuildConsumers(true);

    setTimeout(() => {
      this.thereIsAPendingRestart = false;
    }, 1500);

    return this;
  }

  private async recoverChannel(): Promise<boolean> {
    try {
      logger.log({ level: 'info', message: 'Recover channel event' });
      if (this.preventChannelRecover) return false;
      logger.log({ level: 'info', message: 'Recover channel event accepted' });
      await this.channel?.recover();
      return true;
    } catch (error) {
      logger.log({ level: 'info', message: 'Error when recover channel' });
      logger.log(error);
      return false;
    }
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
    if (!this.connection || !this.channel) await this.restart();
    const messageFromBuffer = this.convertMessageToBuffer(
      convertCamelCaseKeysToSnakeCase(message)
    );

    this.channel?.sendToQueue(queue, messageFromBuffer, {
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
    if (!this.connection || !this.channel) await this.restart();
    this.channel?.publish(
      exchange,
      routingKey,
      this.convertMessageToBuffer(convertCamelCaseKeysToSnakeCase(message)),
      { headers }
    );
  }

  public async consume(queue: string, callback: ConsumerCallback) {
    const consumer = await this.channel?.consume(queue, async (message) => {
      if (!message) return;

      try {
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
        logger.log(error);
        if (error.stack.includes('at JSON.parse')) {
          logger.log({
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
        logger.log({
          level: 'verbose',
          message: 'The message left the queue',
          payload: {
            message: message.content.toString(),
            headers: message.properties.headers,
            properties: { queue, ...message.fields }
          }
        });

        this.ack(message);
      }
    });

    if (!consumer) return;

    this.consumers.set(consumer.consumerTag, { queue, callback });

    logger.log({
      level: 'info',
      message: `Consumer to ${queue} is online!`
    });
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
    const queue = typeof arg1 === 'object' ? arg1.queue : arg1;
    const enabled = typeof arg1 === 'object' ? !!arg1?.enabled : true;

    if (!enabled) return;

    this.consume(queue, jobAdapter(...callbacks));
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
        !this.theChannelIsActive ||
        !this.channel ||
        this.getCustomMessageProperties(message, 'rejected') ||
        this.getCustomMessageProperties(message, 'acked')
      )
        return;
      this.setCustomMessageProperties(message, { rejected: true });
      this.channel.reject(message, requeue);
    } catch (error) {
      logger.log(error);
      logger.log({
        level: 'warn',
        message: 'Unable to reject message',
        payload: { message: message.content.toString() }
      });
    }
  }

  private ack(message: Message) {
    try {
      if (
        !this.theChannelIsActive ||
        !this.channel ||
        this.getCustomMessageProperties(message, 'rejected') ||
        this.getCustomMessageProperties(message, 'acked')
      )
        return;
      this.setCustomMessageProperties(message, { acked: true });
      this.channel.ack(message);
    } catch (error) {
      logger.log(error);
      logger.log({
        level: 'warn',
        message: 'Unable to ack message',
        payload: { message: message.content.toString() }
      });
    }
  }

  private startEventLiveners() {
    this.connection?.on('error', (error) => {
      logger.log(error);
      this.event.emit(this.events.RESTART);
    });

    this.channel?.on('error', async (error) => {
      logger.log(error);

      this.theChannelIsActive = false;

      const wasItRecovered = await this.recoverChannel();

      if (!wasItRecovered) {
        this.event.emit(this.events.RESTART);
      }
    });

    this.connection?.on('close', (error) => {
      logger.log(error);
      if (!this.thereIsAPendingRestart) {
        this.event.emit(this.events.RESTART);
      }
    });

    this.channel?.on('close', async (error) => {
      logger.log(error);
      logger.log(error);

      this.theChannelIsActive = false;

      const wasItRecovered = await this.recoverChannel();

      if (!wasItRecovered && !this.preventChannelRecover) {
        this.event.emit(this.events.RESTART);
      }
    });

    this.event.on(this.events.RESTART, this.restart.bind(this));
  }

  private async rebuildConsumers(deleteConsumers = true) {
    logger.log({ level: 'info', message: 'Starting rebuilding consumers' });
    if (!this.channel) {
      this.event.emit(this.events.RESTART);
      return;
    }

    const consumers = Array.from(this.consumers);

    const promises = consumers.map(async ([key, value]) => {
      try {
        if (deleteConsumers) await this.channel?.cancel(key);
        this.consumers.delete(key);
        return this.consume(value.queue, value.callback);
      } catch (error) {
        logger.log(error);
        return null;
      }
    });

    await Promise.allSettled(promises);
    logger.log({
      level: 'info',
      message: 'Consumer reconstruction completed'
    });
  }

  private convertMessageToBuffer(message: Record<string, unknown>): Buffer {
    const string = JSON.stringify(message);
    return Buffer.from(string);
  }

  private convertMessageToJson(message: Message): object {
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
}
