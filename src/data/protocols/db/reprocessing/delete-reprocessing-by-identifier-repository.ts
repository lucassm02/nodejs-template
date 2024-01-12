export interface DeleteReprocessingByIdentifierRepository {
  delete(
    params: DeleteReprocessingByIdentifierRepository.Params
  ): DeleteReprocessingByIdentifierRepository.Result;
}

export namespace DeleteReprocessingByIdentifierRepository {
  export type Params = { reprocessingIds: string[] };
  export type Result = Promise<void>;
}
