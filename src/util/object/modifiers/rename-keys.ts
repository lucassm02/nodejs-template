export const renameKeys = <T extends object>(
  object: T,
  manifest: { [P in keyof T]?: string }
) => {
  if (typeof object !== 'object') return object;
  const manifestMap = new Map(Object.entries(manifest));

  const renamedEntries = Object.entries(object).map(([key, value]) => {
    const newKey = manifestMap.get(key);
    return newKey ? [newKey, value] : [key, value];
  });

  return Object.fromEntries(renamedEntries);
};
