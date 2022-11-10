import {
  amqpLogger,
  convertCamelCaseKeysToSnakeCase,
  convertSnakeCaseKeysToCamelCase,
} from '@/util';
import { logger } from '@/util/observability';
import { apmSpan, apmTransaction } from '@/util/observability/apm';
import { logger as loggerDecorator } from '@/util/observability/loggers/decorators';
import { Channel, connect, Connection, Message } from 'amqplib';

type Credentials = {
  user: string;
  password: string;
  host: string;
  port: number;
};

type Payload = {
  body: object;
  headers: object;
};

export class RabbitMqServer {
  private connection!: Connection;
  private channel!: Channel;
  private uri!: string;

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

  public setCredentials(credentials: Credentials) {
    this.uri = `amqp://${credentials.user}:${credentials.password}@${credentials.host}:${credentials.port}`;
  }

  public async start() {
    if (this.connection) return;
    if (!this.uri) throw new Error('RABBITMQ_CREDENTIALS_NOT_DEFINED');
    this.connection = await connect(this.uri);
    this.channel = await this.connection.createChannel();
  }

  public async restart() {
    if (this.connection) this.connection.close();
    if (!this.uri) throw new Error('RABBITMQ_CREDENTIALS_NOT_DEFINED');
    this.connection = await connect(this.uri);
    this.channel = await this.connection.createChannel();
  }

  public async close() {
    if (!this.connection) return;
    await this.connection.close();
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
    if (!this.connection || !this.channel) await this.restart();
    const messageFromBuffer = this.messageFromBuffer(
      convertCamelCaseKeysToSnakeCase(message)
    );

    this.channel.sendToQueue(queue, messageFromBuffer, {
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
    if (!this.connection || !this.channel) await this.restart();
    this.channel.publish(
      exchange,
      routingKey,
      this.messageFromBuffer(convertCamelCaseKeysToSnakeCase(message)),
      { headers }
    );
  }

  private messageFromBuffer(message: Record<string, unknown>): Buffer {
    const string = JSON.stringify(message);
    return Buffer.from(string);
  }

  private messageToJson(message: Message): object {
    return convertSnakeCaseKeysToCamelCase(
      JSON.parse(message.content.toString())
    );
  }

  @amqpLogger({
    options: { nameByParameter: 0, subType: 'rabbitmq' },
    input: { message: 1 },
  })
  @apmTransaction({
    options: { nameByParameter: 0, type: 'rabbitmq' },
    params: { message: 1 },
  })
  private async startTransaction(
    _queue: string,
    payload: Payload,
    callback: Function
  ): Promise<void> {
    return callback(payload);
  }

  public async consume(queue: string, callback: (payload: Payload) => void) {
    if (!this.connection || !this.channel) await this.restart();
    await this.channel.consume(queue, async (message) => {
      if (!message) return;

      try {
        const payload = {
          body: this.messageToJson(message),
          headers: message.properties.headers,
          properties: { queue, ...message.fields },
        };

        await this.startTransaction(queue, payload, callback);

        this.channel.ack(message);
      } catch (error) {
        logger.log(error);
        if (error.stack.includes('at JSON.parse')) {
          logger.log({
            level: 'warn',
            message: 'UNABLE_TO_CONVERT_MESSAGE_TO_JSON',
            payload: {
              message: message.content.toString(),
              headers: message.properties.headers,
              properties: { queue, ...message.fields },
            },
          });
        }

        this.channel.ack(message);
      }
    });
  }
}
