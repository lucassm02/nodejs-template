import { ExampleModel } from '@/domain/models';

export interface UpdateExampleRepository {
  update(
    params: UpdateExampleRepository.Params
  ): UpdateExampleRepository.Result;
}

export namespace UpdateExampleRepository {
  export type Params = Pick<
    ExampleModel,
    'value' | 'description' | 'exampleId'
  >;

  export type Result = Promise<void>;
}
