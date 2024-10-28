import { sqlConnection } from '@/infra/db/mssql/util';

export function checkDatabaseConnection() {
  return sqlConnection.raw('SELECT 1');
}
