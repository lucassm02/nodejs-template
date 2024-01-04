import { EXAMPLE_DB, sqlConnection } from '@/infra/db/mssql/util';
import { sumDays } from '@/util';

const {
  EXAMPLE: { EXAMPLE },
  FOO: { FOO }
} = EXAMPLE_DB;

export const seedExampleDatabase = async () => {
  await sqlConnection(FOO.TABLE).insert({
    [FOO.COLUMNS.FOO_ID]: 1,
    [FOO.COLUMNS.EXTERNAL_ID]: 'any_external_id',
    [FOO.COLUMNS.CREATED_AT]: new Date(),
    [FOO.COLUMNS.UPDATED_AT]: sumDays(new Date(), 1), // tomorrow!
    [FOO.COLUMNS.DELETED_AT]: null,
    [FOO.COLUMNS.EXAMPLE_ID]: 1,
    [FOO.COLUMNS.VALUE]: 100
  });

  await sqlConnection(EXAMPLE.TABLE).insert({
    [EXAMPLE.COLUMNS.EXAMPLE_ID]: 1,
    [EXAMPLE.COLUMNS.EXTERNAL_ID]: 'any_external_id',
    [EXAMPLE.COLUMNS.CREATED_AT]: new Date(),
    [EXAMPLE.COLUMNS.UPDATED_AT]: sumDays(new Date(), 1), // tomorrow!
    [EXAMPLE.COLUMNS.DELETED_AT]: null,
    [EXAMPLE.COLUMNS.VALUE]: 100
  });
};
