import { DataValidation } from '@/domain/usecases';
import { YupSchema } from '@/presentation/protocols';

type Schema = YupSchema;
type Data = Record<string, unknown>;
type Exception = string | Error;
type Options = DataValidation.Options | undefined;

type ObjectParams = {
  schema: Schema;
  data: Data;
  exception: Exception;
  options?: Options;
};

type ArrayParams = [Schema, Data, Exception, Options?];

export class UcVanillaDataValidation implements DataValidation {
  private static instance: UcVanillaDataValidation;

  private constructor() {}

  static getInstance(): UcVanillaDataValidation {
    if (!this.instance) this.instance = new UcVanillaDataValidation();
    return this.instance;
  }

  async validate<T extends YupSchema>(
    params: ObjectParams
  ): DataValidation.Result<T>;
  async validate<T extends YupSchema>(
    schema: ArrayParams[0],
    data: ArrayParams[1],
    exception: ArrayParams[2],
    options?: ArrayParams[3]
  ): DataValidation.Result<T>;
  async validate<T extends YupSchema>(
    ...args: [ObjectParams] | ArrayParams
  ): DataValidation.Result<T> {
    let values: ObjectParams;

    if (args.length === 1) {
      [values] = args;
    } else {
      values = {
        schema: args[0],
        data: args[1],
        exception: args[2],
        options: args[3]
      };
    }

    try {
      return await values.schema.validate(values.data);
    } catch (err) {
      if (values.options && !values.options.throws) return;
      if (!(values.exception instanceof Error))
        throw new Error(values.exception);
      throw values.exception;
    }
  }
}
