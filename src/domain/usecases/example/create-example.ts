import { ExampleModel, DatabaseTransactionWrapper } from '@/domain/models';

export interface CreateExample {
  create: (params: CreateExample.Params) => CreateExample.Result;
}

export namespace CreateExample {
  export type Params = { value: string; description: string };
  export type Result = Promise<DatabaseTransactionWrapper<ExampleModel>>;
  export enum Exceptions {}
}
