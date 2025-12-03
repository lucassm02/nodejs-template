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
      requestTimeout: DB.CONNECTION_TIMEOUT_MS,
      options: {
        encrypt: false,
        enableArithAbort: false,
        appName: pkg.name
      }
    },
    pool: {
      max: DB.MAX_POOL,
      min: DB.MIN_POOL,
      acquireTimeoutMillis: DB.CONNECTION_TIMEOUT_MS,
      createTimeoutMillis: DB.CONNECTION_TIMEOUT_MS,
      destroyTimeoutMillis: DB.CONNECTION_TIMEOUT_MS,
      idleTimeoutMillis: DB.IDLE_TIMEOUT_IN_MILLISECONDS,
      reapIntervalMillis: DB.REPEAT_INTERVAL_IN_MS,
      createRetryIntervalMillis: DB.CREATE_RETRY_INTERVAL_IN_MS
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
