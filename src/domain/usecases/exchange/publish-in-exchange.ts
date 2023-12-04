export interface PublishInExchange {
  publish(params: PublishInExchange.Params): PublishInExchange.Result;
}

export namespace PublishInExchange {
  export type Params = {
    exchange: string;
    routingKey: string;
    value: Record<string, unknown>[] | Record<string, unknown>;
  };
  export type Result = Promise<void>;
}
