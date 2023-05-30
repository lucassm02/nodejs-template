import {
  amqpLogger,
  convertCamelCaseKeysToSnakeCase,
  convertSnakeCaseKeysToCamelCase,
} from '@/util';
import { logger } from '@/util/observability';
import { apmSpan, apmTransaction } from '@/util/observability/apm';
import { logger as loggerDecorator } from '@/util/observability/loggers/decorators';
import { Channel, Connection, Message, connect } from 'amqplib';
import { randomUUID } from 'crypto';
import { EventEmitter } from 'stream';

import { Consumer, ConsumerCallback, Credentials, Payload } from './types';

type ChannelWrapper = { id: string; channel: Channel };

export class RabbitMqServer {
  private connection: Connection | null = null;
  private channelWrapper: ChannelWrapper | null = null;
  private consumers: Map<string, Consumer> = new Map();
  private uri!: string;
  private prefetch!: number;

  private thereIsAPendingRestart = false;

  public Error = {
    CredentialsNotDefined:
      'Credentials not defined, use setCredentials to define credentials',
    InvalidCredentialFieldValue: (field: string) =>
      `Invalid value for (${field}) field`,
    InvalidPrefetchValue: 'Prefetch must be a number',
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

    this.uri = `amqp://${credentials.user}:${credentials.password}@${credentials.host}:${credentials.port}`;
    return this;
  }

  public async start() {
    logger.log({ level: 'info', message: 'Starting connection' });
    if (!this.connection) {
      if (!this.uri) throw new Error(this.Error.CredentialsNotDefined);
      this.connection = await connect(this.uri);
    }

    this.channelWrapper?.channel.recover();

    if (!this.channelWrapper) {
      const channel = await this.connection.createChannel();
      this.channelWrapper = { channel, id: randomUUID() };
    }

    if (typeof this.prefetch === 'number') {
      await this.channelWrapper.channel.prefetch(this.prefetch);
    }

    this.startEventLiveners();

    logger.log({ level: 'info', message: 'Connection started' });

    return this;
  }

  public async close() {
    logger.log({ level: 'info', message: 'Closing connection' });

    if (this.channelWrapper) {
      try {
        await this.channelWrapper.channel.close();
      } catch (error) {
        logger.log(error);
      }
    }

    this.channelWrapper?.channel.removeAllListeners();
    this.connection?.removeAllListeners();
    this.event.removeAllListeners();

    if (this.connection) {
      try {
        await this.connection.close();
      } catch (error) {
        logger.log(error);
      }
    }

    this.channelWrapper = null;
    this.connection = null;

    logger.log({ level: 'info', message: 'Connection closed' });

    return this;
  }

  public async restart() {
    logger.log({ level: 'info', message: 'Restart event' });
    if (this.thereIsAPendingRestart) return;
    if (!this.channelWrapper || !this.connection) return;
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

  @loggerDecorator({
    options: { name: 'Publish message in queue', subType: 'rabbitmq' },
    input: { queue: 0, message: 1, headers: 2 },
  })
  @apmSpan({
    options: { name: 'Publish message in queue', subType: 'rabbitmq' },
    params: { queue: 0, message: 1, headers: 2 },
  })
  public async publishInQueue(queue: string, message: object, headers: object) {
    if (!this.connection || !this.channelWrapper) await this.restart();
    const messageFromBuffer = this.convertMessageToBuffer(
      convertCamelCaseKeysToSnakeCase(message)
    );

    this.channelWrapper?.channel?.sendToQueue(queue, messageFromBuffer, {
      headers,
    });
  }
  @loggerDecorator({
    options: { name: 'Publish message in exchange', subType: 'rabbitmq' },
    input: { exchange: 0, message: 1, routingKey: 2, headers: 3 },
  })
  @apmSpan({
    options: { name: 'Publish message in exchange', subType: 'rabbitmq' },
    params: { exchange: 0, message: 1, routingKey: 2, headers: 3 },
  })
  public async publishInExchange(
    exchange: string,
    message: object,
    routingKey: string,
    headers?: object
  ) {
    if (!this.connection || !this.channelWrapper) await this.restart();
    this.channelWrapper?.channel.publish(
      exchange,
      routingKey,
      this.convertMessageToBuffer(convertCamelCaseKeysToSnakeCase(message)),
      { headers }
    );
  }

  public async consume(queue: string, callback: ConsumerCallback) {
    const channelId = this.channelWrapper?.id;

    const consumer = await this.channelWrapper?.channel.consume(
      queue,
      async (message) => {
        if (!message) return;

        try {
          const payload = {
            body: message.content.toJSON(),
            headers: message.properties.headers,
            properties: { queue, ...message.fields },
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
                properties: { queue, ...message.fields },
              },
            });
          }
        } finally {
          logger.log({
            level: 'verbose',
            message: 'The massage left the queue',
            payload: {
              message: message.content.toString(),
              headers: message.properties.headers,
              properties: { queue, ...message.fields },
            },
          });

          this.event.emit(this.events.ACK, {
            message,
            channelId,
          });
        }
      }
    );

    if (!consumer) return;

    this.consumers.set(consumer.consumerTag, { queue, callback });
  }

  private startEventLiveners() {
    this.connection?.on('error', (error) => {
      logger.log(error);
      this.event.emit(this.events.RESTART);
    });

    this.channelWrapper?.channel.on('error', (error) => {
      logger.log(error);
      this.event.emit(this.events.RESTART);
    });

    this.connection?.on('close', (error) => {
      logger.log(error);
      this.event.emit(this.events.RESTART);
    });

    this.channelWrapper?.channel.on('close', (error) => {
      logger.log(error);
      this.event.emit(this.events.RESTART);
    });

    this.event.on(this.events.RESTART, async () => {
      await this.restart();
    });

    this.event.on(
      this.events.ACK,
      ({ message, channelId }: { message: Message; channelId: string }) => {
        try {
          if (!message) return;
          if (this.channelWrapper?.id !== channelId) return;

          this.channelWrapper?.channel.ack(message);
        } catch (error) {
          logger.log(error);
          logger.log({
            level: 'warn',
            message: 'Unable to ack message',
            payload: { message: message.content.toString() },
          });
        }
      }
    );
  }

  private async rebuildConsumers(deleteConsumers = true) {
    logger.log({ level: 'info', message: 'Starting rebuilding consumers' });
    if (!this.channelWrapper) {
      this.event.emit(this.events.RESTART);
      return;
    }

    const consumers = Array.from(this.consumers);

    const promises = consumers.map(async ([key, value]) => {
      try {
        if (deleteConsumers) await this.channelWrapper?.channel.cancel(key);
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
      message: 'Consumer reconstruction completed',
    });
  }

  private convertMessageToBuffer(message: Record<string, unknown>): Buffer {
    const string = JSON.stringify(message);
    return Buffer.from(string);
  }

  @amqpLogger({
    options: { nameByParameter: 0, subType: 'rabbitmq' },
    input: { message: 1 },
  })
  @apmTransaction({
    options: { nameByParameter: 0, type: 'rabbitmq' },
    params: { message: 1 },
  })
  private async transactionHandler(
    _queue: string,
    payload: Payload,
    callback: Function
  ): Promise<void> {
    const { body, headers, ...restOfPayload } = payload;
    const bodyAndHeadersToCamelCase = convertSnakeCaseKeysToCamelCase({
      body,
      headers,
    });

    return callback({ ...bodyAndHeadersToCamelCase, ...restOfPayload });
  }
}
