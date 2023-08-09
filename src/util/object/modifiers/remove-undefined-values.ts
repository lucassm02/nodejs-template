import { recursiveDataConvertFilterLayer } from '../formatters/recursive-data-converter';

const formatter = <T extends Object>(object: T) => {
  const entries = Object.entries(object).filter(
    ([_, value]) => value !== undefined
  );
  return Object.fromEntries(entries);
};

export const removeUndefinedValues = <T>(records: T) => {
  return recursiveDataConvertFilterLayer(records, formatter);
};
