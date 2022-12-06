export interface GetExampleRepository {
  get(): GetExampleRepository.Result;
}

export namespace GetExampleRepository {
  type Model = {
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
