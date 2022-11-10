export interface CreateInputAndOutputLogRepositoryRepository {
  create(
    params: CreateInputAndOutputLogRepositoryRepository.Params
  ): CreateInputAndOutputLogRepositoryRepository.Result;
}

export namespace CreateInputAndOutputLogRepositoryRepository {
  export type Params = {
    type: string;
    [key: string]: unknown;
  };

  export type Result = Promise<void>;
}
