export const recursiveDataConvertFilterLayer = (
  data: any,
  formatter: (params: any) => any
) => {
  if (Array.isArray(data))
    return data.map((item) => {
      if (data instanceof Date) return data;
      if (typeof item === 'object')
        return recursiveDataConvertApplyLayer(item, formatter);
      return item;
    });
  if (data instanceof Date) return data;
  if (typeof data === 'object')
    return recursiveDataConvertApplyLayer(data, formatter);
  return data;
};
const recursiveDataConvertApplyLayer = (
  object: Record<string, unknown>,
  formatter: (params: any) => any
): Record<string, unknown> => {
  if (!object) return object;
  const objectWithNewKeys = formatter(object);
  const objectEntries = Object.entries(objectWithNewKeys);
  return objectEntries.reduce((accumulator, currentValue) => {
    const [key, value] = currentValue;
    if (Array.isArray(value)) {
      const newValue = recursiveDataConvertFilterLayer(value, formatter);
      return { ...accumulator, [key]: newValue };
    }
    if (value instanceof Date) {
      return { ...accumulator, [key]: value };
    }
    if (typeof value === 'object') {
      return {
        ...accumulator,
        [key]: recursiveDataConvertFilterLayer(value, formatter),
      };
    }
    return { ...accumulator, [key]: value };
  }, {});
};
