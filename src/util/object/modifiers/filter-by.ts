export const filterBy = <T, V>(
  records: T[],
  by: (keyof T)[],
  value: V[]
): T[] => {
  if (!value?.[0]) return records;

  const result = records.filter((record) => record?.[by?.[0]] === value[0]);

  const [, ...nextKeys] = by;
  const [, ...nextValues] = value;

  if (value?.[1]) return filterBy(result, nextKeys, nextValues);
  return result;
};
