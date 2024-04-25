type UnknownObject = Record<string, unknown>;
type Args = UnknownObject[];
export function merge<T extends Args = Args>(...objects: T) {
  const isObject = (obj: unknown) => obj && typeof obj === 'object';

  return objects.reduce((prev, obj) => {
    if (!obj) return prev;

    Object.keys(obj).forEach((key) => {
      const pVal = prev[key];
      const oVal = obj[key];

      if (Array.isArray(pVal) && Array.isArray(oVal)) {
        prev[key] = pVal.concat(...oVal);
      } else if (isObject(pVal) && isObject(oVal)) {
        prev[key] = merge(<UnknownObject>pVal, <UnknownObject>oVal);
      } else {
        prev[key] = oVal;
      }
    });

    return prev;
  }, {});
}
