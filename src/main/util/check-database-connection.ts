import { sqlConnection } from '@/infra/db/mssql/util';
import { DB } from '@/util';

export async function checkDatabaseConnection() {
  return sqlConnection.raw(DB.DB_TEST_CONNECTION_QUERY);
}
