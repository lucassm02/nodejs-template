import { EXAMPLE_DB, sqlConnection } from '@/infra/db/mssql/util';
import { sumDays } from '@/util';

const {
  EXAMPLE: { EXAMPLE }
} = EXAMPLE_DB;

export const seedExampleDatabase = async () => {
  // implement seed here!
  await sqlConnection(EXAMPLE.TABLE).insert({
    external_id: 'any_external_id',
    created_at: new Date(),
    updated_at: sumDays(new Date(), 1), // tomorrow!
    deleted_at: null,
    example_id: 1,
    value: 100
  });
};
