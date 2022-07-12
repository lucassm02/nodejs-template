import {
  amqpLogger,
  convertCamelCaseKeysToSnakeCase,
  convertSnakeCaseKeysToCamelCase,
} from '@/util';
import { apmSpan, apmTransaction } from '@/util/observability/apm';
import { decorator } from '@/util/observability/loggers/decorator';
import { logger } from '@/util/observability/loggers/default';
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

type GenericObject = {
  [key: string]: any;
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

  @decorator({
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

    return new Promise<void>((resolve) => {
      this.channel.sendToQueue(queue, messageFromBuffer, {
        headers,
      });

      resolve();
    });
  }
  @decorator({
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

  private messageFromBuffer(message: GenericObject): Buffer {
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
  private async handleMessage(
    queue: string,
    payload: Payload,
    callback: Function
  ): Promise<void> {
    try {
      return await callback(payload);
    } catch (error) {
      logger.log(error);
    }
  }

  public async consume(queue: string, callback: (payload: Payload) => void) {
    if (!this.connection || !this.channel) await this.restart();
    await this.channel.consume(queue, async (message) => {
      if (!message) return;

      const payload = {
        body: this.messageToJson(message),
        headers: message?.properties?.headers,
      };

      await this.handleMessage(queue, payload, callback);

      this.channel.ack(message);
    });
  }
}
