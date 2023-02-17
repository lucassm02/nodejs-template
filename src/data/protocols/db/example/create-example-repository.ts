import { DatabaseTransactionWrapper } from '@/domain/models';

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

  type Model = {
    exampleId: string;
    externalId: string;
    value: string;
    description: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: string;
  };

  export type Result = Promise<DatabaseTransactionWrapper<Model>>;
}
