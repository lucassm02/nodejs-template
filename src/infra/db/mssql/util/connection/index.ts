import pkg from '@/../package.json';
import { DB } from '@/util/constants';

import { knex } from '../knex';

export const sqlConnection = knex({
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
    },
  },
});
