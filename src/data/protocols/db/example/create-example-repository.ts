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
    exampleId: number;
    externalId: string;
    value: string;
    description: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date;
  };

  export type Result = Promise<DatabaseTransactionWrapper<Model>>;
}
