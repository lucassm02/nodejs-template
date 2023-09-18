export {};

declare global {
  type RemoveUnderscoreFirstLetter<S extends string> =
    S extends `${infer FirstLetter}${infer U}`
      ? `${FirstLetter extends '_' ? U : `${FirstLetter}${U}`}`
      : S;

  type SnakeCase<S extends string> = S extends `${infer T}${infer U}`
    ? `${T extends Capitalize<T> ? '_' : ''}${RemoveUnderscoreFirstLetter<
        Lowercase<T>
      >}${SnakeCase<U>}`
    : S;

  type ObjectKeysToSnakeCase<T> = {
    [K in keyof T as SnakeCase<K & string>]: T[K];
  };

  type CamelCase<S extends string> =
    S extends `${infer P1}_${infer P2}${infer P3}`
      ? `${Lowercase<P1>}${Uppercase<P2>}${CamelCase<P3>}`
      : Lowercase<S>;

  type ObjectKeysToCamelCase<T> = {
    [K in keyof T as CamelCase<string & K>]: T[K];
  };

  type Table<T extends string> = {
    getColumnsObject: {
      (keyCase: 'UPPER'): { [P in Uppercase<T>]: string };
      (keyCase: 'LOWER'): { [P in Lowercase<T>]: string };
      (keyCase: 'CAMEL'): { [P in CamelCase<T>]: string };
      (keyCase: 'SNAKE'): { [P in SnakeCase<T>]: string };
    };
    TABLE: string;
    ALIAS: string;
    COLUMNS: { [P in Uppercase<T>]: string };
    RAW_COLUMNS: readonly T[];
  };
}
