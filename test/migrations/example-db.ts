/**
 * @description This should be used to up and down all or part of a database!
 */

import { EXAMPLE_DB } from '@/infra/db/mssql/util';
import { createMockTable, downMockTable } from '@/util/db';

const {
  EXAMPLE: { EXAMPLE }
} = EXAMPLE_DB;

export const migrate = {
  // implement migration here!
  up: async () => {
    const promiseExampleTb = createMockTable(EXAMPLE, {
      created_at: new Date(), // pass the value according to the type!
      updated_at: new Date(),
      deleted_at: new Date(),
      description: 'description',
      external_id: 'external_id',
      example_id: 999,
      value: 999
    });
    await Promise.all([promiseExampleTb]);
  },
  // implement rollback here!
  down: async () => {
    const promiseDownExampleTb = downMockTable(EXAMPLE);
    await Promise.all([promiseDownExampleTb]);
  }
};
