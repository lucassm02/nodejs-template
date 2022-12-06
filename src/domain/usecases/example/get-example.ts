import { ExampleModel } from '@/domain/models';

export interface GetExample {
  get: () => GetExample.Result;
}

export namespace GetExample {
  export type Result = Promise<ExampleModel[]>;
  export enum Exceptions {
    NO_EXAMPLE_WAS_FOUND = 'No example found, contact administrator.',
  }
}
