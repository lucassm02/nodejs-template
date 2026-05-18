export const filterBy = <T, V>(
  records: T[],
  by: (keyof T)[],
  value: V[]
): T[] => {
  let result = records;

  for (let i = 0; i < by.length; i++) {
    if (!value?.[i]) break;
    result = result.filter((record) => record?.[by[i]] === value[i]);
  }

  return result;
};
