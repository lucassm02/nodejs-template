export const recursiveDataConvertFilterLayer = <T>(
  data: T,
  formatter: <N extends object>(params: N) => N
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
  formatter: <N extends object>(params: N) => N
): unknown => {
  if (!object) return object;
  const objectWithNewKeys = formatter(object);
  const objectEntries = Object.entries(objectWithNewKeys);
  return objectEntries.reduce(
    (accumulator: Record<string, unknown>, [key, value]) => {
      if (Array.isArray(value)) {
        accumulator[key] = recursiveDataConvertFilterLayer(value, formatter);
      } else if (value instanceof Date) {
        accumulator[key] = value;
      } else if (typeof value === 'object') {
        accumulator[key] = recursiveDataConvertFilterLayer(value, formatter);
      } else {
        accumulator[key] = value;
      }
      return accumulator;
    },
    {}
  );
};
