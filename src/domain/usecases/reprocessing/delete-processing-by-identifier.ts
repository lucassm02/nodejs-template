export interface DeleteProcessingByIdentifier {
  delete(
    params: DeleteProcessingByIdentifier.Params
  ): DeleteProcessingByIdentifier.Result;
}

export namespace DeleteProcessingByIdentifier {
  export type Params = {
    reprocessingId: string;
    reprocessing: object;
    queue: string;
  }[];
  export type Result = Promise<void>;
}
