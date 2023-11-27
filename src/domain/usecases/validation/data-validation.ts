import { YupSchema } from '@/presentation/protocols';

export interface DataValidation {
  validate<T>(params: {
    schema: DataValidation.Schema;
    exception: DataValidation.Exception;
    options?: DataValidation.Options;
  }): Promise<T>;
  validate<T>(
    schema: DataValidation.Schema,
    exception: DataValidation.Exception,
    options?: DataValidation.Options
  ): Promise<T>;
}

export namespace DataValidation {
  export type Schema = YupSchema;
  export type Exception = string;
  export type Options = {
    throws?: boolean;
  };
}
