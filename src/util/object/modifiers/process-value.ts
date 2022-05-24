export const processValue = <T>(
  object: T,
  manifest: { [P in keyof T]?: Function }
) => {
  if (typeof object !== 'object') return object;

  const manifestEntries = Object.entries(manifest);

  const renamedEntries = Object.entries(object as any).map((keyValue) => {
    const matchValue = manifestEntries.find(([key]) => key === keyValue[0]);
    if (matchValue && typeof matchValue[1] === 'function')
      return [matchValue[0], matchValue[1](keyValue[1])];

    return keyValue;
  });

  return Object.fromEntries(renamedEntries);
};
