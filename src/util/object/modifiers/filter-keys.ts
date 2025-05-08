import { transform } from '../handlers';

type Options<T> = {
  allowedKeys?: (keyof T)[];
  deniedKeys?: (keyof T)[];
};

export const filterKeys = <T extends object>(
  object: T,
  options: Options<T>
) => {
  if (typeof object !== 'object') return object;

  function filter(
    object: object,
    action: 'ALLOW' | 'DENY',
    values: string[] = []
  ) {
    if (values.length === 0) return object;

    const filteredEntries = Object.entries(object).filter(([key]) => {
      if (action === 'ALLOW') return values.includes(key);
      return !values.includes(key);
    });

    return Object.fromEntries(filteredEntries);
  }

  type Keys = string[] | undefined;

  return transform(object)
    .pipe((value) => filter(value, 'ALLOW', <Keys>options.allowedKeys))
    .pipe((value) => filter(value, 'DENY', <Keys>options.deniedKeys))
    .get();
};
