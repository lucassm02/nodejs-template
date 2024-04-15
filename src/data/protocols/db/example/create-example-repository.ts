import { DatabaseTransactionWrapper, ExampleModel } from '@/domain/models';

export interface CreateExampleRepository {
  create(
    params: CreateExampleRepository.Params
  ): CreateExampleRepository.Result;
}

export namespace CreateExampleRepository {
  export type Params = {
    value: string;
    description: string;
  };

  export type Result = Promise<DatabaseTransactionWrapper<ExampleModel>>;
}
