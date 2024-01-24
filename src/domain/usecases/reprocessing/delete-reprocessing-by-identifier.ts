export interface DeleteReprocessingByIdentifier {
  delete(
    params: DeleteReprocessingByIdentifier.Params
  ): DeleteReprocessingByIdentifier.Result;
}

export namespace DeleteReprocessingByIdentifier {
  export type Params = {
    reprocessingId: string;
    reprocessing: object;
    queue: string;
  }[];
  export type Result = Promise<void>;
}
