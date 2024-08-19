import pkg from '@/../package.json';
import { DB } from '@/util/constants';

import { knex } from '../knex';

const configs = {
  default: {
    cacheClient: 'node-cache',
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
    client: 'sqlite3+',
    connection: ':memory:',
    cacheClient: 'node-cache',
    useNullAsDefault: true
  }
};

export const getConfig = () =>
  DB.CONFIG.toUpperCase() === 'TEST' ? configs.test : configs.default;

export const sqlConnection = knex(getConfig());
