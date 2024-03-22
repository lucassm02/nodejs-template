import {
  convertCamelCaseKeysToSnakeCase,
  convertSnakeCaseKeysToCamelCase
} from '@/util';

import { getTableName } from './get-table-name';

export type Options<T> = {
  table: string;
  alias?: string;
  columns: readonly T[];
};

type BuilderOptions = {
  database: string;
  tablePrefix?: string;
};

type KeyCase = 'UPPER' | 'LOWER' | 'CAMEL' | 'SNAKE';
export type Table<T extends string> = {
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

export const makeTableBuilder =
  ({ database, tablePrefix }: BuilderOptions) =>
  <T extends string>(options: Options<T>) => {
    type Columns = typeof options.columns;

    // TODO: This function could be segregate to be more testable
    function makeColumns(
      array: string[],
      tableName: string,
      keyCase: 'UPPER'
    ): { [P in Uppercase<Columns[number]>]: string };
    function makeColumns(
      array: string[],
      tableName: string,
      keyCase: 'LOWER'
    ): { [P in Lowercase<Columns[number]>]: string };
    function makeColumns(
      array: string[],
      tableName: string,
      keyCase: 'CAMEL'
    ): { [P in CamelCase<Columns[number]>]: string };
    function makeColumns(
      array: string[],
      tableName: string,
      keyCase: 'SNAKE'
    ): { [P in SnakeCase<Columns[number]>]: string };
    function makeColumns(array: string[], tableName: string, keyCase: KeyCase) {
      const entries = array.map((key) => {
        const value = `${tableName}.${key}`;

        if (keyCase === 'UPPER') {
          return [key.toUpperCase(), value];
        }

        if (keyCase === 'LOWER') {
          return [key.toLowerCase(), value];
        }

        return [key, value];
      });

      const object = Object.fromEntries(entries);

      if (['UPPER', 'LOWER'].includes(keyCase)) return object;

      const handler = {
        CAMEL: convertSnakeCaseKeysToCamelCase,
        SNAKE: convertCamelCaseKeysToSnakeCase
      };

      return handler[<'CAMEL' | 'SNAKE'>keyCase](object);
    }

    // TODO: This function could be segregate to be more testable
    function getColumnsObject(keyCase: 'UPPER'): {
      [P in Uppercase<Columns[number]>]: string;
    };
    function getColumnsObject(keyCase: 'LOWER'): {
      [P in Lowercase<Columns[number]>]: string;
    };
    function getColumnsObject(keyCase: 'CAMEL'): {
      [P in CamelCase<Columns[number]>]: string;
    };
    function getColumnsObject(keyCase: 'SNAKE'): {
      [P in SnakeCase<Columns[number]>]: string;
    };
    function getColumnsObject(keyCase: KeyCase): Object {
      return makeColumns(
        <string[]>(<unknown>options.columns),
        table,
        <never>keyCase
      );
    }

    const table = getTableName(database, options);

    const prefix = tablePrefix ?? '';
    const defaultAlias = options.table.replace(prefix, '').toLocaleUpperCase();
    const alias = options.alias ?? defaultAlias;
    const tableWithAlias = `${table} as [${alias}]`;

    return {
      getColumnsObject,
      TABLE: table,
      ALIAS: tableWithAlias,
      COLUMNS: makeColumns(
        <string[]>(<unknown>options.columns),
        table,
        'UPPER'
      ),
      RAW_COLUMNS: options.columns
    };
  };
