import { InferType } from 'yup';

import { YupSchema } from '@/presentation/protocols';

export interface StaticDataValidation {
  new (): DataValidation;
  getInstance(): InstanceType<this>;
}
export interface DataValidation {
  validate<T extends YupSchema>(params: {
    schema: T;
    data: Record<string, unknown>;
    exception: DataValidation.Exception;
    options?: DataValidation.Options;
  }): DataValidation.Result<T>;
  validate<T extends YupSchema>(
    schema: T,
    data: Record<string, unknown>,
    exception: DataValidation.Exception,
    options?: DataValidation.Options
  ): DataValidation.Result<T>;
}

export namespace DataValidation {
  export enum Exceptions {
    INVALID_DATA = 'sorry, the data provided is invalid.'
  }
  export type Schema = YupSchema;
  export type Exception = string;
  export type Result<T extends YupSchema> = InferType<T>;
  export type Options = {
    throws?: boolean;
  };
}
