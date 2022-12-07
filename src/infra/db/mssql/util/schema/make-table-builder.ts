type Options<T> = {
  table: string;
  alias?: string;
  columns: readonly T[];
};

type BuilderOptions = {
  database: string;
  tablePrefix?: string;
};

export const makeTableBuilder =
  ({ database, tablePrefix }: BuilderOptions) =>
  <T extends string>(options: Options<T>) => {
    const table = `[${database}].${options.table}`;

    const prefix = tablePrefix ?? '';

    const defaultAlias = options.table.replace(prefix, '').toLocaleUpperCase();

    const alias = options.alias ?? defaultAlias;

    const tableWithAlias = `${table} as [${alias}]`;

    const columns = options.columns.reduce((accumulator, current) => {
      return {
        ...accumulator,
        [String(current).toUpperCase()]: `${table}.${current}`,
      };
    }, {});

    type Columns = typeof options.columns;

    return {
      TABLE: table,
      ALIAS: tableWithAlias,
      COLUMNS: columns as { [P in Uppercase<Columns[number]>]: string },
      RAW_COLUMNS: options.columns,
    };
  };
