import { ExampleModel } from '@/domain/models';

export interface GetExampleRepository {
  get(): GetExampleRepository.Result;
}

export namespace GetExampleRepository {
  export type Result = Promise<ExampleModel[]>;
}
