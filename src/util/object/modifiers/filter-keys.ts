export const filterKeys = <T>(object: T, allowedKeys: (keyof T)[]) => {
  if (typeof object !== 'object') return object;

  const filteredEntries = Object.entries(object as any).filter(([key]) =>
    allowedKeys.includes(key as keyof T)
  );

  return Object.fromEntries(filteredEntries);
};
