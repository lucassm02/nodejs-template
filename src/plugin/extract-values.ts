import { InferType } from 'yup';

import { DataValidation as DataValidationInterface } from '@/domain/usecases/validation';
import { DataValidation } from '@/data/usecases/other';
import { YupSchema } from '@/presentation/protocols';
import { getIn } from '@/util';

type Sources = Record<string, Record<string, unknown>>;

type Config = (string | Record<string, string>)[];

type Option = {
  values: Config;
  sources: Sources;
};

type ValidationParams<Schema> = {
  schema: Schema;
  exception?: string | Error;
  throws?: boolean;
};

export class ExtractValues {
  private readonly validator: DataValidation;

  constructor(protected readonly config: Config = []) {
    this.validator = DataValidation.getInstance();
  }

  private validate<Schema extends YupSchema>(
    value: Record<string, unknown>,
    options: ValidationParams<Schema>
  ): InferType<Schema> {
    const details = {
      data: value,
      exception: options.exception,
      schema: options.schema
    };

    if (options.throws === false) {
      return this.validator.validate({
        ...details,
        options: { throws: false }
      });
    }

    return this.validator.validate({
      ...details,
      options: { throws: true }
    });
  }

  private extractValues({ sources, values }: Option) {
    const object: Record<string, unknown> = {};

    const setKeyValue = (keyName: string, target: string, path: string) => {
      if (target !== 'state' && target !== 'request') return;
      const targetValue = getIn(sources[target], path);
      if (object[keyName] !== undefined && !targetValue) return;
      object[keyName] = targetValue;
    };

    for (const value of values) {
      if (typeof value === 'string') {
        const [target, ...restOfChunks] = value.split('.');
        const targetKey = restOfChunks.at(-1);
        if (!targetKey) continue;
        const path = restOfChunks.join('.');
        setKeyValue(targetKey, target, path);
      }

      if (typeof value === 'object') {
        const entries = Object.entries(value).at(-1);
        if (!entries) continue;
        const [alias, valuePath] = entries;
        const [target, ...restOfChunks] = valuePath.split('.');
        const path = restOfChunks.join('.');
        setKeyValue(alias, target, path);
      }
    }

    return object;
  }

  protected extractValuesFromSources<T extends Record<string, unknown>>(
    sources: Sources
  ): T;
  protected extractValuesFromSources<Schema extends YupSchema>(
    sources: Sources,
    options?: ValidationParams<Schema>
  ): InferType<Schema>;
  protected extractValuesFromSources<Schema extends YupSchema>(
    sources: Sources,
    options?: ValidationParams<Schema>
  ) {
    const extractedValue = this.extractValues({
      sources,
      values: this.config
    });

    if (!options) return extractedValue;
    const validatedExtractedValue = this.validate(extractedValue, options);
    return validatedExtractedValue as InferType<typeof options.schema>;
  }
}

export namespace ExtractValues {
  export type Config = (string | Record<string, string>)[];
  export const { Exceptions } = DataValidationInterface;
}
