import { Knex } from 'knex';

import { Table, sqlConnection } from '@/infra/db/mssql/util';

import 'dotenv/config';
import { tryToRun } from '../functions';
import {
  StringSchema,
  BooleanSchema,
  DateSchema,
  NumberSchema
} from './types/';
import { PermittedTypes, TypeSchema } from './types/schema';

type StrictTypesConversion<T extends readonly string[]> = {
  [P in T[number]]: DateSchema | StringSchema | BooleanSchema | NumberSchema;
};

export const allowMethodsInKnex = (knex: Knex.CreateTableBuilder) => ({
  string: knex.string,
  date: knex.date,
  number: knex.integer,
  boolean: knex.boolean
});

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
    Object.entries(schema).forEach(async ([key, value]) => {
      if (value instanceof TypeSchema) {
        const { __type: type } = value;

        switch (type as PermittedTypes) {
          case 'date':
            if (!value.__default) builder.datetime(key);
            builder.datetime(key).defaultTo(await tryToRun(value.__default));
            break;
          case 'number':
            if (!value.__default) builder.integer(key);
            builder.integer(key).defaultTo(await tryToRun(value.__default));
            break;
          case 'boolean':
            if (!value.__default) builder.boolean(key);
            builder.boolean(key).defaultTo(await tryToRun(value.__default));
            break;
          default:
            if (!value.__default) builder.string(key);
            builder.string(key).defaultTo(await tryToRun(value.__default));
            break;
        }
      }
    });
  });
};
