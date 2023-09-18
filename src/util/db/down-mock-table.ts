import { sqlConnection } from '@/infra/db/mssql/util';

export const downMockTable = async (table: Table<string>) => {
  if (process.env.NODE_ENV !== 'test')
    throw new Error('Need to be in a test environment to use this function');
  await sqlConnection.schema.dropTableIfExists(table.TABLE);
};
