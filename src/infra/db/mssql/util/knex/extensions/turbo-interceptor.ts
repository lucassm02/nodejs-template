import k, { type Knex } from 'knex';
import NodeCache from 'node-cache';

import { logger } from '@/util';

const cache = new NodeCache({ stdTTL: 100, checkperiod: 120 });
const MAX_MEMORY_USAGE = 100 * 1024 * 1024; // 100 MB
const MAX_RESULT_SIZE = 1024 * 1024; // 1 MB

function checkMemoryUsage() {
  const memoryUsage = process.memoryUsage();
  return memoryUsage.heapUsed < MAX_MEMORY_USAGE;
}

function cacheKey(sql: Knex.Sql) {
  return sql.sql + JSON.stringify(sql.bindings);
}

function cacheQuery(sql: Knex.Sql, result: unknown) {
  const key = cacheKey(sql);
  cache.set(key, result);
}

function saveToCache(sql: Knex.Sql, result: unknown) {
  setImmediate(() => {
    const resultSize = Buffer.byteLength(JSON.stringify(result));

    if (resultSize > MAX_RESULT_SIZE) {
      logger.log({
        level: 'warn',
        message: `Result size ${resultSize} exceeds maximum allowed size of ${MAX_RESULT_SIZE}. Cache not saved.`
      });
      return;
    }

    cacheQuery(sql, result);
  });
}

function getCachedQuery(sql: Knex.Sql) {
  const key = cacheKey(sql);
  return cache.get(key);
}

const ALLOWED_METHODS = ['select', 'insert', 'update', 'delete'];

export function pluginInterceptorPlugin(knex: typeof k) {
  const knexProxy = new Proxy(knex, {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    get(target: any, propKey, _receiver) {
      const originalMethod = target[propKey];

      if (typeof originalMethod !== 'function') {
        return originalMethod;
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return function (...args: any[]) {
        const queryBuilder = originalMethod.apply(target, args);

        if (!ALLOWED_METHODS.includes(<string>propKey)) return queryBuilder;

        return new Proxy(queryBuilder, {
          apply(target, propKey, _receiver) {
            if (propKey === 'then') {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              return async function (handler: any) {
                if (!target._turbo) return target.then(handler);

                const sql = target.toSQL();

                const cachedResult = getCachedQuery(sql);

                if (cachedResult) {
                  return Promise.resolve(cachedResult).then(handler);
                }

                const result = await target.then(handler);

                if (!checkMemoryUsage()) {
                  logger.log({
                    level: 'warn',
                    message: 'Memory usage is too high. Disabling cache.'
                  });
                  return result;
                }

                saveToCache(sql, result);

                return result;
              };
            }
          }
        });
      };
    }
  });

  return knexProxy;
}
