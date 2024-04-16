import { Table, sqlConnection } from '@/infra/db/mssql/util';

import 'dotenv/config';
import { tryToRun } from '../functions';
import {
  BooleanSchema,
  DateSchema,
  NumberSchema,
  StringSchema,
  TypeSchema
} from './schemas';

type StrictTypesConversion<T extends readonly string[]> = {
  [P in T[number]]: DateSchema | StringSchema | BooleanSchema | NumberSchema;
};

export const createMockTable = async <
  T extends Table<string>,
  Schema extends StrictTypesConversion<T['RAW_COLUMNS']>
>(
  table: T,
  schema: Schema
) => {
  if (String(process.env.NODE_ENV).toLowerCase() !== 'test')
    throw new Error('Need to be in a test environment to use this function');

  if (typeof table !== 'object') return;

  if (!table.getColumnsObject)
    throw new Error('Missing dependency getColumnsObject at table object');

  const tableExists = await sqlConnection.schema.hasTable(table.TABLE);

  if (tableExists) return;

  await sqlConnection.schema.createTable(table.TABLE, (builder) => {
    Object.entries(schema).forEach(([key, value]) => {
      if (value instanceof TypeSchema) {
        const { getType: type } = value;
        switch (type) {
          case 'date':
            if (!value.getDefault) builder.datetime(key);
            else builder.datetime(key).defaultTo(tryToRun(value.getDefault));
            break;
          case 'number':
            if (!value.getDefault) builder.integer(key);
            else builder.integer(key).defaultTo(tryToRun(value.getDefault));
            break;
          case 'boolean':
            if (!value.getDefault) builder.boolean(key);
            else builder.boolean(key).defaultTo(tryToRun(value.getDefault));
            break;
          default:
            if (!value.getDefault) builder.string(key);
            else builder.string(key).defaultTo(tryToRun(value.getDefault));
            break;
        }
      }
    });
  });
};
