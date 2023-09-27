import { Knex } from 'knex';

import { sqlConnection } from '@/infra/db/mssql/util';

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
  // if (process.env.NODE_ENV !== 'test')
  //   throw new Error('Need to be in a test environment to use this function');
  if (typeof table !== 'object') return;
  if (!table.getColumnsObject)
    throw new Error('Missing dependency getColumnsObject at table object');
  await sqlConnection.schema.createTable(table.TABLE, (builder) => {
    Object.entries(schema).forEach(([key, value]) => {
      if (value instanceof TypeSchema) {
        const fnSchema = {
          string: builder.string,
          date: builder.date,
          number: builder.integer,
          boolean: builder.boolean
        };

        const fn = fnSchema[value.__type as PermittedTypes];

        const _exec = !value.__default
          ? fn(key)
          : fn(key).defaultTo(tryToRun(value.__default));
      }
    });
  });
};
