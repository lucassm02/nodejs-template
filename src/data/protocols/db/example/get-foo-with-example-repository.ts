export interface GetFooWithExampleRepository {
  getFooWithExample(
    params: GetFooWithExampleRepository.Params
  ): GetFooWithExampleRepository.Result;
}
export namespace GetFooWithExampleRepository {
  export type Params = { fooId: number };
  type Model = {
    fooId: string;
    exampleId: string;
    externalId: string;
    value: string;
    description: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: string;
  };
  export type Result = Promise<Model[]>;
}
