export type Credentials = {
  user: string;
  password: string;
  host: string;
  port: number;
};

export type Payload = {
  body: object;
  headers: object;
};

export type ConsumerCallback = (payload: Payload) => Promise<void>;

export type Consumer = {
  queue: string;
  callback: ConsumerCallback;
};
