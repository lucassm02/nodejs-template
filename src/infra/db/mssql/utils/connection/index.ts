import pkg from '@/../package.json';
import { DB } from '@/util/constants';
import knex from 'knex';

const config = {
  client: DB.DIALECT,
  connection: {
    host: DB.HOST,
    port: +DB.PORT,
    user: DB.USERNAME,
    password: DB.PASSWORD,
    options: {
      encrypt: false,
      enableArithAbort: false,
      appName: pkg.name,
      validateBulkLoadParameters: false,
    },
  },
};

export const sqlConnection = knex(config);
