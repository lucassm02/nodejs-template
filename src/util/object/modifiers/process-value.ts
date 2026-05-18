export const processValue = <T extends object>(
  object: T,
  manifest: { [P in keyof T]?: Function }
) => {
  if (typeof object !== 'object') return object;

  const manifestMap = new Map(Object.entries(manifest));

  const renamedEntries = Object.entries(object).map(([key, value]) => {
    const fn = manifestMap.get(key);
    if (fn && typeof fn === 'function') return [key, fn(value)];
    return [key, value];
  });

  return Object.fromEntries(renamedEntries);
};
