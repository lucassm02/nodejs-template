type Options<T> = {
  allowedKeys?: (keyof T)[];
  deniedKeys?: (keyof T)[];
};

export type FilterKeys = <T extends object>(
  object: T,
  options: Options<T>
) => T;
