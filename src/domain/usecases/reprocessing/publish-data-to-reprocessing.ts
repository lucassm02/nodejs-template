export interface PublishDataToReprocessing {
  publish(
    params: PublishDataToReprocessing.Params
  ): PublishDataToReprocessing.Result;
}

export namespace PublishDataToReprocessing {
  export type Params = {
    reprocessingId: string;
    reprocessing: object;
    queue: string;
  }[];
  export type Result = Promise<void>;
}
