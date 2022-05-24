type Options<T> = { from: T | T[]; attribute: keyof T; copyFrom: keyof T };

export const overrideAttributeValue = <T>({
  from,
  attribute,
  copyFrom,
}: Options<T>): T => {
  const override = (object: any) => {
    if (typeof object !== 'object') return object;
    const entries = Object.entries(object).map(([key, value]) => {
      if (key === attribute) return;
      if (key === copyFrom) return [attribute, value];
      return [key, value];
    });

    const filteredEntries = entries.filter(
      (item) => item !== undefined
    ) as any[];

    return Object.fromEntries(filteredEntries);
  };

  if (Array.isArray(from)) return from.map(override) as unknown as T;
  return override(from);
};
