import 'dotenv/config';
import { sqlConnection } from '@/infra/db/mssql/util';

type StrictTypesConversion<T extends readonly string[]> = {
  [P in T[number]]: string | null | boolean | Date | number;
};

export const createMockTable = async <
  T extends Table<string>,
  Schema extends StrictTypesConversion<T['RAW_COLUMNS']>
>(
  table: T,
  schema: Schema
) => {
  if (process.env.NODE_ENV !== 'test')
    throw new Error('Need to be in a test environment to use this function');
  if (typeof table !== 'object') return;
  if (!table.getColumnsObject)
    throw new Error('Missing dependency getColumnsObject at table object');
  await sqlConnection.schema.createTable(table.TABLE, (builder) => {
    Object.entries(schema).forEach(([key, value]) => {
      switch (value) {
        case value instanceof Date:
          builder.date(key);
          break;
        case typeof value === 'number':
          builder.integer(key);
          break;
        case typeof value === 'string':
          builder.string(key);
          break;
        default:
          builder.integer(key);
      }
    });
  });
};
