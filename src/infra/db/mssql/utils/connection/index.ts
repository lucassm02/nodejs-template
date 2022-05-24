import { DATABASE } from '@/util/constants';
import knex from 'knex';

const config = {
  client: DATABASE.DB_DIALECT,
  connection: {
    host: DATABASE.DB_HOST,
    port: +DATABASE.DB_PORT,
    user: DATABASE.DB_USERNAME,
    password: DATABASE.DB_PASSWORD,
    options: {
      encrypt: false,
      enableArithAbort: false,
      appName: 'telecall-portability-gateway',
      validateBulkLoadParameters: false,
    },
  },
};

export const sqlConnection = knex(config);
