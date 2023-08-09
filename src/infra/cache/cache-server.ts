import memjs, { Client } from 'memjs';
import { Error } from 'mongoose';

type Connection = {
  host: string;
  port: number;
  user?: string;
  password?: string;
};

type SetOption = {
  key: string;
  value: string | Record<string, unknown> | Record<string, unknown>[];
  ttl?: number;
};
type GetOptions = { parseToJson: boolean };

export class CacheServer {
  private static instance: CacheServer;
  private server!: Client;
  private connectionString!: string;
  private connected: boolean = false;

  public Error = {
    CONNECTION_ERROR: 'Server not connected!',
    CREDENTIALS_NOT_DEFINED: 'Server credentials not defined!',
    UNABLE_TO_CONVERT_VALUE_TO_JSON: 'Unable to convert value to JSON!'
  };

  constructor() {}

  public static getInstance(): CacheServer {
    if (!CacheServer.instance) {
      CacheServer.instance = new CacheServer();
    }

    return CacheServer.instance;
  }
  public setCredentials(...params: Connection[]): this;
  public setCredentials(params: Connection[]): this;
  public setCredentials(params: Connection): this;
  public setCredentials(
    host: string,
    port: number,
    user?: string,
    password?: string
  ): this;
  public setCredentials(...args: unknown[]): this {
    if (args.length === 1 && typeof args[0] === 'object') {
      this.connectionString = this.makeConnectionString(<Connection>args[0]);
      return this;
    }

    if (args.length > 1 && Array.isArray(args[0])) {
      this.connectionString = args[0].map(this.makeConnectionString).join(',');
      return this;
    }

    if (args.length > 1 && args.every((value) => typeof value === 'object')) {
      this.connectionString = (args as unknown as Connection[])
        .map((connection: Connection) => this.makeConnectionString(connection))
        .join(',');
      return this;
    }

    this.connectionString = this.makeConnectionString({
      host: <string>args[0],
      port: <number>args[1],
      user: <string>args[2],
      password: <string>args[3]
    });

    return this;
  }

  public connect() {
    if (!this.connectionString)
      throw new Error(this.Error.CREDENTIALS_NOT_DEFINED);
    if (this.connected) return;
    this.server = memjs.Client.create(this.connectionString);
    this.connected = true;
  }

  public disconnect() {
    if (!this.connect) return;
    this.server.close();
    this.connected = false;
  }

  public async set(
    key: SetOption['key'],
    value: SetOption['value'],
    ttl?: SetOption['ttl']
  ): Promise<boolean>;
  public async set({ key, value, ttl }: SetOption): Promise<boolean>;
  public async set(...args: unknown[]): Promise<boolean> {
    return this.define(args, 'SET');
  }

  public async replace(
    key: SetOption['key'],
    value: SetOption['value'],
    ttl?: SetOption['ttl']
  ): Promise<boolean>;
  public async replace({ key, value, ttl }: SetOption): Promise<boolean>;
  public async replace(...args: unknown[]): Promise<boolean> {
    return this.define(args, 'REPLACE');
  }

  public async get(
    key: string,
    options: { parseToJson: true }
  ): Promise<Record<string, unknown> | undefined>;
  public async get(
    key: string,
    options: { parseToJson: false }
  ): Promise<Buffer | undefined>;
  public async get(
    key: string,
    options?: GetOptions
  ): Promise<Buffer | undefined>;
  public async get(key: string, options?: GetOptions) {
    this.checkConnection();
    const response = await this.server.get(key);
    if (!response.value) return undefined;
    if (options?.parseToJson) {
      try {
        const string = response.value.toString();
        return JSON.parse(string);
      } catch (error) {
        throw new Error(this.Error.UNABLE_TO_CONVERT_VALUE_TO_JSON);
      }
    }
    return response.value;
  }

  public async delete(key: string): Promise<boolean> {
    this.checkConnection();
    return this.server.delete(key);
  }

  private checkConnection() {
    if (!this.connected) throw new Error(this.Error.CONNECTION_ERROR);
  }

  private makeConnectionString({
    port,
    host,
    password,
    user
  }: Connection): string {
    const serverAndPortString = `${host}:${port}`;
    if (!user || !password) return serverAndPortString;
    return `${user}:${password}@${serverAndPortString}`;
  }

  private parseValueToString(value: SetOption['value']) {
    return typeof value === 'object' ? JSON.stringify(value) : value;
  }

  private async define(
    args: unknown[],
    method: 'REPLACE' | 'SET'
  ): Promise<boolean> {
    this.checkConnection();

    const { key, value, ttl } = <SetOption>(
      (args.length > 1
        ? { key: args[0], value: args[1], ttl: args[2] }
        : args[0])
    );

    const options = ttl ? { expires: ttl } : undefined;

    const handler =
      method === 'SET'
        ? this.server.add.bind(this.server)
        : this.server.replace.bind(this.server);

    return handler(key, this.parseValueToString(value), options);
  }
}
