export interface PublishDataToReprocessing {
  publish(
    params: PublishDataToReprocessing.Params
  ): PublishDataToReprocessing.Result;
}

export namespace PublishDataToReprocessing {
  export type Params = {
    reprocessingId: string;
    reprocessing: object;
    headers: object;
    exchange: string;
    routingKey: string;
    createdAt: Date;
    queue: string;
  }[];
  export type Result = Promise<void>;
}
