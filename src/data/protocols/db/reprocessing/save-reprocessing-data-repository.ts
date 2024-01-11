export interface SaveReprocessingDataRepository {
  save(
    params: SaveReprocessingDataRepository.Params
  ): SaveReprocessingDataRepository.Result;
}

export namespace SaveReprocessingDataRepository {
  export type Params = {
    exchange?: string;
    message: object;
    routingKey: string;
    queue: string;
  };
  export type Result = Promise<void>;
}
