import { isArgumentsObject } from 'util/types';

import { DataValidation } from '@/domain/usecases';
import { YupSchema } from '@/presentation/protocols';

export class UcVanillaDataValidation implements DataValidation {
  async validate<T>(params: {
    schema: YupSchema;
    exception: string;
    options?: DataValidation.Options | undefined;
  }): Promise<T>;
  async validate<T>(
    schema: YupSchema,
    exception: string,
    options?: DataValidation.Options | undefined
  ): Promise<T>;
  async validate<T>(...args: any[]): Promise<T> {
    let _schema: YupSchema;
    let _exception: string;
    let _options: DataValidation.Options | undefined;

    if (!isArgumentsObject(args)) {
      const [schema, exception, options] = args;
      _schema = schema;
      _exception = exception;
      _options = options;
    }

    const [params] = args;
    const { schema, exception } = params;

    _schema = schema;
    _exception = exception;
    _options = params.options;

    try {
      // TODO: bind the Data to the validation function of yup
      return _schema.validate({});
    } catch (err) {
      if (_options && !_options.throws) return Promise.resolve({} as T);
      throw new Error(exception);
    }
  }
}
