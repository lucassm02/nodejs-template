import { EXAMPLE_DB, sqlConnection } from '@/infra/db/mssql/util';
import { sumDays } from '@/util';

const {
  EXAMPLE: { EXAMPLE }
} = EXAMPLE_DB;

export const seedExampleDatabase = async () => {
  // implement seed here!
  await sqlConnection(EXAMPLE.TABLE).insert({
    [EXAMPLE.COLUMNS.EXTERNAL_ID]: 'any_external_id',
    [EXAMPLE.COLUMNS.CREATED_AT]: new Date(),
    [EXAMPLE.COLUMNS.UPDATED_AT]: sumDays(new Date(), 1), // tomorrow!
    [EXAMPLE.COLUMNS.DELETED_AT]: null,
    [EXAMPLE.COLUMNS.EXAMPLE_ID]: 1,
    [EXAMPLE.COLUMNS.VALUE]: 100
  });
};
