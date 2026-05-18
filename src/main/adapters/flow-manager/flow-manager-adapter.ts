import { equals } from '@/util/comparation';
import { getIn } from '@/util/object';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RecordValue = any;

type When =
  | string
  | string[]
  | Record<string, RecordValue>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  | ((...args: any[]) => boolean);

export type Option = {
  when?: When;
  strict?: boolean;
  handler: Function;
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

export default function flowManager(options: Option[]): Function;
export default function flowManager(
  firstOption: Option,
  ...options: Option[]
): Function;
export default function flowManager(
  arg1: Option[] | Option,
  ...restOfOptions: Option[]
) {
  return (...args: unknown[]) => {
    const firstOptions = Array.isArray(arg1) ? arg1 : [arg1];
    const options = [...firstOptions, ...restOfOptions];

    for (const option of options) {
      if (!option.when) return option.handler(...args);

      if (typeof option.when === 'function') {
        const isValid = option.when(...args);
        if (!isValid) continue;
        return option.handler(...args);
      }

      if (typeof option.when === 'string') {
        const valueFound =
          getIn(args, option.when) ?? getIn(<object>args[0], option.when);
        if (typeof valueFound !== 'boolean' && !valueFound) continue;
        return option.handler(...args);
      }

      if (Array.isArray(option.when)) {
        let isValid = true;
        for (const value of option.when) {
          if (typeof value !== 'string') continue;
          const valueFound =
            getIn(args, value) ?? getIn(<object>args[0], value);
          if (typeof valueFound !== 'boolean' && !valueFound) {
            isValid = false;
            break;
          }
        }
        if (!isValid) continue;
        return option.handler(...args);
      }

      let isValid = true;
      for (const [targetKey, expectedValue] of Object.entries(option.when)) {
        const valueFound =
          getIn(args, targetKey) ?? getIn(<object>args[0], targetKey);

        if (typeof valueFound !== 'boolean' && !valueFound) {
          isValid = false;
          break;
        }

        let matches: boolean;
        if (
          typeof valueFound === 'object' &&
          typeof expectedValue === 'object'
        ) {
          matches = option.strict
            ? JSON.stringify(valueFound) === JSON.stringify(expectedValue)
            : equals(valueFound, expectedValue);
        } else if (option.strict) {
          matches = valueFound === expectedValue;
        } else {
          matches =
            coercion(valueFound, typeof expectedValue) === expectedValue;
        }

        if (!matches) {
          isValid = false;
          break;
        }
      }

      if (isValid) return option.handler(...args);
    }
  };
}
