import { ExampleModel } from '@/domain/models';
import { Wrapper } from '@/domain/models/transaction';

export interface CreateExample {
  create: (params: CreateExample.Params) => CreateExample.Result;
}

export namespace CreateExample {
  export type Params = { value: string; description: string };
  export type Result = Promise<Wrapper<ExampleModel>>;
  export enum Exceptions {}
}
