export const renameKeys = <T extends Object>(
  object: T,
  manifest: { [P in keyof T]?: string }
) => {
  if (typeof object !== 'object') return object;
  const manifestEntries = Object.entries(manifest);

  const renamedEntries = Object.entries(object).map((keyValue) => {
    const matchValue = manifestEntries.find(([key]) => key === keyValue[0]);
    if (matchValue) return [matchValue[1], keyValue[1]];
    return keyValue;
  });

  return Object.fromEntries(renamedEntries);
};
