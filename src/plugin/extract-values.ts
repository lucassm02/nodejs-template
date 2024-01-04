import { exceptions } from 'winston';
import { InferType } from 'yup';

import { UcVanillaDataValidation } from '@/data/usecases/validation';
import { YupSchema } from '@/presentation/protocols';
import { getIn } from '@/util';

type Sources = Record<string, Record<string, unknown>>;

type Values = (string | Record<string, string>)[];

type Option = {
  values: Values;
  sources: Sources;
};

type ValidationParams = {
  schema: YupSchema;
  exception?: string | Error;
};

export class ExtractValues {
  private readonly validator: UcVanillaDataValidation;

  constructor(protected readonly valuesToExtract: Values = []) {
    this.validator = UcVanillaDataValidation.getInstance();
  }

  private validate<Schema extends YupSchema>(
    value: Record<string, unknown>,
    options: ValidationParams
  ): InferType<Schema> {
    const details = {
      data: value,
      exception: options.exception,
      schema: options.schema
    };

    if (!exceptions)
      return this.validator.validate({
        ...details,
        options: { throws: false }
      });

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

  protected extractValuesFromSources(
    sources: Sources,
    options?: ValidationParams
  ): Record<string, unknown> {
    const extractedValue = this.extractValues({
      sources,
      values: this.valuesToExtract
    });

    if (!options) return extractedValue;

    const validatedExtractedValue = <Record<string, unknown>>(
      this.validate(extractedValue, options)
    );

    return validatedExtractedValue;
  }
}
