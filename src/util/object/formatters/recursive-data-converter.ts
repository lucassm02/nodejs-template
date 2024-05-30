export const recursiveDataConvertFilterLayer = <T>(
  data: T,
  formatter: <N extends Object>(params: N) => N
) => {
  if (Array.isArray(data)) {
    return data.map((item) => {
      if (item instanceof Date) return item;
      if (typeof item === 'object')
        return recursiveDataConvertApplyLayer(item, formatter);
      return item;
    });
  }
  if (data instanceof Date) return data;
  if (typeof data === 'object')
    return recursiveDataConvertApplyLayer(data, formatter);
  return data;
};

const recursiveDataConvertApplyLayer = <T>(
  object: T,
  formatter: <N extends Object>(params: N) => N
): unknown => {
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
        [key]: recursiveDataConvertFilterLayer(value, formatter)
      };
    }
    return { ...accumulator, [key]: value };
  }, {});
};
