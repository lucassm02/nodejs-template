export type Credentials = {
  user: string;
  password: string;
  host: string;
  port: number;
  virtualHost?: string;
};

export type Payload = Record<string, unknown>;

export type ConsumerCallback = (payload: Payload) => Promise<void>;

export type Consumer = {
  queue: string;
  callback: ConsumerCallback;
};

export type ConsumerOptions = { queue: string; enabled?: boolean };
