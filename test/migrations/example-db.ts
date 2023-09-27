/**
 * @description This should be used to up and down all or part of a database!
 */

import { EXAMPLE_DB } from '@/infra/db/mssql/util';
import { createMockTable, downMockTable } from '@/util/db';
import { date, number, string } from '@/util/db/types';

const {
  EXAMPLE: { EXAMPLE }
} = EXAMPLE_DB;

export const migrate = {
  // implement migration here!
  up: async () => {
    const promiseExampleTb = createMockTable(EXAMPLE, {
      created_at: date().default(() => new Date()),
      updated_at: date().default(() => new Date()),
      deleted_at: date().default(() => new Date()),
      description: string(),
      external_id: string(),
      example_id: number(),
      value: number()
    });
    await Promise.all([promiseExampleTb]);
  },
  // implement rollback here!
  down: async () => {
    const promiseDownExampleTb = downMockTable(EXAMPLE);
    await Promise.all([promiseDownExampleTb]);
  }
};
