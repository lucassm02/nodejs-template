export const getIn = (object: Object, path: string) => {
  const INDEX_PATTERN = /\[(\d+?)\]/;

  const splittedPath = path.split('.');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const targetValue = splittedPath.reduce((memo: any, key: string) => {
    const index = key.match(INDEX_PATTERN);
    if (index) {
      return memo && memo[index[1]] && memo[index[1]];
    }

    return memo && memo[key] && memo[key];
  }, object);

  return targetValue;
};
