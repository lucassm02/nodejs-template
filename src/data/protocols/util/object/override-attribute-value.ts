type Options<T> = { from: T | T[]; attribute: keyof T; copyFrom: keyof T };

export type OverrideAttributeValue = <T>(options: Options<T>) => T;
