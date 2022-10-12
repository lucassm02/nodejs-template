import { getIn } from '@/util/object';

import makeFlow from './fow-adapter';

type RecordValue = string | number;

type When = string | string[] | Record<string, RecordValue>;

export type Option = {
  when?: When;
  targetIndex?: number;
  strict?: boolean;
  handler: Function;
};

const allValuesAreValid = (values: unknown[]): boolean => {
  const findNonComplianceResult = values.find((value) => value === false);
  return findNonComplianceResult !== false;
};

function coercion(value: any, type: 'string' | 'number' | 'bigint' | string) {
  if (type === 'bigint') return BigInt(value);
  if (type === 'number') return Number(value);
  if (type === 'string') return String(value);
  throw new Error('INVALID_TYPE');
}

export function flowManagerAdapter(...options: Option[]): Function;
export function flowManagerAdapter(
  firstOption: Option,
  ...restOfOptions: Option[]
) {
  return (...args: unknown[]) => {
    const options = [firstOption, ...restOfOptions];

    for (const option of options) {
      const targetIndex = option.targetIndex ?? 0;

      const target = args?.[targetIndex];

      if (!option.when) return option.handler(...args);

      if (typeof option.when === 'string') {
        const valueFound = getIn(<Object>target, option.when);
        if (typeof valueFound !== 'boolean' && !valueFound) continue;
        return option.handler(...args);
      }

      if (Array.isArray(option.when)) {
        const keyPaths = option.when.filter(
          (value) => typeof value === 'string'
        );

        const valuesFound = keyPaths.map((value) => {
          return getIn(<Object>target, value);
        });

        const result = valuesFound.map(
          (valueFound) => !(valueFound !== 'boolean' && !valueFound)
        );

        const isValid = allValuesAreValid(result);

        if (!isValid) continue;

        return option.handler(...args);
      }

      if (typeof target !== 'object') return option.handler(...args);

      const whenEntries = Object.entries(option.when);

      const result = whenEntries.map((entries) => {
        const [targetKey, expectedValue] = entries;

        const valueFound = getIn(<Object>target, targetKey);

        if (typeof valueFound !== 'boolean' && !valueFound) return false;

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

export const handleListHandlers = (
  ...args: (Function | { handle: Function })[]
) => {
  return async (
    request: Record<string, unknown>,
    response: Record<string, unknown>,
    finish: Function,
    state: [Record<string, unknown>, Function]
  ) => {
    type Payload = {
      state: Record<string, unknown>;
      request: Record<string, unknown>;
      response: Record<string, unknown>;
    };

    const middlewares = args.map((middleware) => {
      return ({ state, request, response }: Payload, next: Function) => {
        if (typeof middleware === 'function')
          return middleware(request, response, next, state);

        return middleware.handle(request, response, state, next);
      };
    });

    await makeFlow({ state, request, response })(...middlewares)();
    if (response.headersSent) return;
    return finish();
  };
};
