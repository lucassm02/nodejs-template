export interface DeleteProcessingByIdentifierRepository {
  delete(
    params: DeleteProcessingByIdentifierRepository.Params
  ): DeleteProcessingByIdentifierRepository.Result;
}

export namespace DeleteProcessingByIdentifierRepository {
  export type Params = { reprocessingIds: string[] };
  export type Result = Promise<void>;
}
