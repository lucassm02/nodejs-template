import { equals } from '@/util/comparation';
import { getIn } from '@/util/object';

type RecordValue = any;

type When =
  | string
  | string[]
  | Record<string, RecordValue>
  | ((...args: any[]) => boolean);

export type Option = {
  when?: When;
  strict?: boolean;
  handler: Function;
};

const allValuesAreValid = (values: unknown[]): boolean => {
  const findNonComplianceResult = values.find((value) => value === false);
  return findNonComplianceResult !== false;
};

function coercion(
  value: string | number | boolean,
  type: 'string' | 'number' | 'bigint' | string
) {
  if (type === 'bigint') return BigInt(value);
  if (type === 'number') return Number(value);
  if (type === 'string') return String(value);
  if (type === 'boolean') return Boolean(value);
  throw new Error('INVALID_TYPE');
}

export default function flowManager(...options: Option[]): Function;
export default function flowManager(
  firstOption: Option,
  ...restOfOptions: Option[]
) {
  return (...args: unknown[]) => {
    const options = [firstOption, ...restOfOptions];

    for (const option of options) {
      if (!option.when) return option.handler(...args);

      if (typeof option.when === 'function') {
        const isValid = option.when(...args);
        if (!isValid) continue;
        return option.handler(...args);
      }

      if (typeof option.when === 'string') {
        const valueFound =
          getIn(args, option.when) ?? getIn(<Object>args[0], option.when);
        if (typeof valueFound !== 'boolean' && !valueFound) continue;
        return option.handler(...args);
      }

      if (Array.isArray(option.when)) {
        const keyPaths = option.when.filter(
          (value) => typeof value === 'string'
        );

        const valuesFound = keyPaths.map((value) => {
          return getIn(args, value) ?? getIn(<Object>args[0], value);
        });

        const result = valuesFound.map(
          (valueFound) => !(valueFound !== 'boolean' && !valueFound)
        );

        const isValid = allValuesAreValid(result);

        if (!isValid) continue;

        return option.handler(...args);
      }

      const whenEntries = Object.entries(option.when);

      const result = whenEntries.map((entries) => {
        const [targetKey, expectedValue] = entries;

        const valueFound =
          getIn(args, targetKey) ?? getIn(<Object>args[0], targetKey);

        if (typeof valueFound !== 'boolean' && !valueFound) return false;

        if (
          option.strict &&
          typeof valueFound === 'object' &&
          typeof expectedValue === 'object'
        ) {
          return JSON.stringify(valueFound) === JSON.stringify(expectedValue);
        }

        if (
          !option.strict &&
          typeof valueFound === 'object' &&
          typeof expectedValue === 'object'
        ) {
          return equals(valueFound, expectedValue);
        }

        if (option.strict) return valueFound === expectedValue;

        const typeOfValue = typeof expectedValue;

        const valueFoundAfterCoercion = coercion(valueFound, typeOfValue);

        return valueFoundAfterCoercion === expectedValue;
      });

      const isValid = allValuesAreValid(result);

      if (isValid) return option.handler(...args);
    }
  };
}
