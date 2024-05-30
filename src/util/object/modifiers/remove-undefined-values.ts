import { recursiveDataConvertFilterLayer } from '../formatters/recursive-data-converter';

const formatter = <T extends Object>(object: T): T => {
  const entries = Object.entries(object).filter(
    ([, value]) => value !== undefined
  );
  return Object.fromEntries(entries) as T;
};

export const removeUndefinedValues = <T>(records: T) => {
  return recursiveDataConvertFilterLayer(records, formatter);
};
