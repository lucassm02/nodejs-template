export const getIn = (object: Object, path: string) => {
  const splittedPath = path.split('.');
  const targetValue = splittedPath.reduce(
    (memo: any, key: string) => memo && memo[key] && memo[key],
    object
  );

  return targetValue;
};
