export interface CreateInputAndOutputLogRepositoryRepository {
  create(
    params: CreateInputAndOutputLogRepositoryRepository.Params
  ): CreateInputAndOutputLogRepositoryRepository.Result;
}

export namespace CreateInputAndOutputLogRepositoryRepository {
  type GenericObject = { [key: string]: any };

  export type Params = {
    type: string;
    [key: string]: any;
  };

  export type Result = Promise<void>;
}
