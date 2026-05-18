// TODO: We should seek better alternatives in the future, but for now, it's not a problem.
/* eslint-disable @typescript-eslint/no-explicit-any */
type Options<T> = { from: T | T[]; attribute: keyof T; copyFrom: keyof T };

export const overrideAttributeValue = <T>({
  from,
  attribute,
  copyFrom
}: Options<T>): T => {
  const override = (object: any) => {
    if (typeof object !== 'object') return object;
    const filteredEntries: [string, unknown][] = [];

    for (const [key, value] of Object.entries(object)) {
      if (key === attribute) continue;
      filteredEntries.push(
        key === copyFrom ? [attribute as string, value] : [key, value]
      );
    }

    return Object.fromEntries(filteredEntries);
  };

  if (Array.isArray(from)) return from.map(override) as unknown as T;
  return override(from);
};
