export const getIn = (object: Object, path: string) => {
  const INDEX_PATTERN = /\[(\d+?)\]/;

  const splittedPath = path.split('.');

  const targetValue = splittedPath.reduce((memo: any, key: string) => {
    const index = key.match(INDEX_PATTERN);
    if (index) {
      return memo && memo[index[1]] && memo[index[1]];
    }

    return memo && memo[key] && memo[key];
  }, object);

  return targetValue;
};

export const pipe =
  <Type>(value: Type) =>
  (...functions: ((value: Type) => any)[]) =>
    functions.reduce((value, fn) => fn(value), value);
