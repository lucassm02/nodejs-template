import { ExampleModel } from '@/domain/models';

export interface GetExampleRepository {
  get(): GetExampleRepository.Result;
}

export namespace GetExampleRepository {
  type Model = {
    exampleId: number;
    externalId: string;
    value: string;
    description: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date;
  };
  export type Result = Promise<ExampleModel[]>;
}
