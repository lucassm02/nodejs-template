// eslint-disable-next-line max-classes-per-file
import { DataValidation as Interface } from '@/domain/usecases';
import { YupSchema } from '@/presentation/protocols';

type Schema = YupSchema;
type Data = Record<string, unknown>;
type Exception = string | Error | undefined;
type Options = Interface.Options | undefined;

type ObjectParams = {
  schema: Schema;
  data: Data;
  exception: Exception;
  options?: Options;
};

type ArrayParams = [Schema, Data, Exception, Options?];

class CustomError extends Error {
  constructor(
    public readonly message: string,
    public readonly items: string[]
  ) {
    super(message);
  }
}

export class DataValidation implements Interface {
  private static instance: DataValidation;

  private constructor() {}

  static getInstance(): DataValidation {
    if (!this.instance) this.instance = new DataValidation();
    return this.instance;
  }

  validate<T extends YupSchema>(params: ObjectParams): Interface.Result<T>;
  validate<T extends YupSchema>(
    schema: ArrayParams[0],
    data: ArrayParams[1],
    exception: ArrayParams[2],
    options?: ArrayParams[3]
  ): Interface.Result<T>;
  validate<T extends YupSchema>(
    ...args: [ObjectParams] | ArrayParams
  ): Interface.Result<T> {
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
      return values.schema.validateSync(values.data, { abortEarly: false });
    } catch (error) {
      const items = error.inner.map((item: Record<string, unknown>) => ({
        message: item.message,
        key: item.path
      }));

      if (values.options && !values.options.throws)
        return {
          [Interface.Exceptions.ERROR_REFERENCE]: items,
          ...values.data
        };
      if (values.options && !values.exception) {
        throw new CustomError(Interface.Exceptions.VALIDATION_ERROR, items);
      }
      if (!(values.exception instanceof Error))
        throw new Error(values.exception);
      throw values.exception;
    }
  }
}
