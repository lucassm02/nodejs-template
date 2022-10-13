export const getIn = (object: Object, path: string) => {
  const splittedPath = path.split('.');
  const targetValue = splittedPath.reduce((memo: any, key: string) => {
    const index = <number | null>key.match(/[(\d*)]/);

    if (index) {
      return memo && memo[index] && memo[index];
    }

    return memo && memo[key] && memo[key];
  }, object);

  return targetValue;
};
