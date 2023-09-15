import pkg from '@/../package.json';
import { DB } from '@/util/constants';

import { knex } from '../knex';

const configs = {
  default: {
    client: DB.DIALECT,
    connection: {
      host: DB.HOST,
      port: +DB.PORT,
      user: DB.USERNAME,
      password: DB.PASSWORD,
      options: {
        encrypt: false,
        enableArithAbort: false,
        appName: pkg.name
      }
    }
  },
  test: {
    client: DB.DIALECT,
    connection: {
      host: DB.HOST,
      port: +DB.PORT,
      user: DB.USERNAME,
      password: DB.PASSWORD,
      options: {
        encrypt: false,
        enableArithAbort: false,
        appName: pkg.name
      }
    }
  }
};

const config = process.env.NODE_ENV === 'test' ? configs.default : configs.test;

export const sqlConnection = knex(config);
