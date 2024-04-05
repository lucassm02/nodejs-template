import { EXAMPLE_DB, sqlConnection } from '@/infra/db/mssql/util';

const {
  EXAMPLE: { EXAMPLE },
  FOO: { FOO }
} = EXAMPLE_DB;

export const seedExampleDatabase = async () => {
  await sqlConnection(FOO.TABLE).insert({
    [FOO.COLUMNS.FOO_ID]: 1,
    [FOO.COLUMNS.EXAMPLE_ID]: 1,
    [FOO.COLUMNS.VALUE]: 100
  });

  await sqlConnection(EXAMPLE.TABLE).insert({
    [EXAMPLE.COLUMNS.EXAMPLE_ID]: 1,
    [EXAMPLE.COLUMNS.VALUE]: 100
  });
};
