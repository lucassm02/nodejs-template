import { createHash } from 'node:crypto';
import k, { Knex } from 'knex';
import NodeCache from 'node-cache';

import { logger } from '@/util';
import { makeCacheServer } from '@/infra/cache';

type Services = 'memjs' | 'node-cache';
type GenericObject = Record<string, unknown>;

function generateHashKeyToMemJs(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

const cache = new NodeCache({ stdTTL: 100, checkperiod: 120 });
const memCache = makeCacheServer();

const MAX_MEMORY_USAGE = 100 * 1024 * 1024 * 3; // ~ 300 MB
const MAX_RESULT_SIZE = 1024 * 1024 * 5; // ~ 5 MB

const DEFAULT_CACHE_SERVICE = 'node-cache';

function checkMemoryUsage() {
  const memoryUsage = process.memoryUsage();
  return memoryUsage.heapUsed < MAX_MEMORY_USAGE;
}

function cacheKey(sql: Knex.Sql) {
  return sql.sql + JSON.stringify(sql.bindings);
}

function nodeCacheQuery(sql: Knex.Sql, result: unknown) {
  const key = cacheKey(sql);
  cache.set(key, result);
}

async function memCacheQuery(sql: Knex.Sql, result: GenericObject) {
  await memCache.set({
    key: generateHashKeyToMemJs(cacheKey(sql)),
    value: result
  });
}

async function cacheQuery(sql: Knex.Sql, result: unknown, service: Services) {
  if (service === 'node-cache') {
    return nodeCacheQuery(sql, result);
  }

  return memCacheQuery(sql, <GenericObject>result);
}

async function getCachedQueryMemCache(sql: Knex.Sql) {
  const key = generateHashKeyToMemJs(cacheKey(sql));
  const buffer = await memCache.get(key);

  if (!buffer) return;

  try {
    return JSON.parse(buffer.toString());
  } catch (_error) {
    return buffer.toString();
  }
}

function getCachedQueryNodeCache(sql: Knex.Sql) {
  const key = cacheKey(sql);
  return cache.get(key);
}

async function getCachedQuery(sql: Knex.Sql, service: Services) {
  if (service === 'node-cache') return getCachedQueryNodeCache(sql);
  return getCachedQueryMemCache(sql);
}

function saveToCache(sql: Knex.Sql, result: unknown, service: Services) {
  setImmediate(async () => {
    const resultSize = Buffer.byteLength(JSON.stringify(result));

    if (resultSize > MAX_RESULT_SIZE) {
      logger.log({
        level: 'warn',
        message: `Result size ${resultSize} exceeds maximum allowed size of ${MAX_RESULT_SIZE}. Cache not saved.`
      });
      return;
    }

    try {
      await cacheQuery(sql, result, service);
    } catch (error) {
      logger.log({
        level: 'warn',
        message: `Error saving cache. Due to ${error.message}`
      });
    }
  });
}

function resolveWrapperToSaveInCache(
  resolve: (data: object | object[]) => void,
  sql: Knex.Sql,
  service: Services
) {
  return (data: object | object[]) => {
    try {
      if (typeof data !== 'object') {
        resolve(data);
        return;
      }

      if (!checkMemoryUsage()) {
        logger.log({
          level: 'warn',
          message: 'Memory usage exceeded maximum allowed. Cache not saved.'
        });
        return resolve(data);
      }

      saveToCache(sql, data, service);

      resolve(data);
    } catch (_error) {
      logger.log({
        level: 'error',
        message: 'Error parsing data to ne save. Cache not saved.'
      });
      resolve(data);
    }
  };
}

export function turboInterceptorPlugin(knex: typeof k) {
  const knexProxy = new Proxy(knex, {
    apply(target, _, [arg]) {
      const instanceOfKnex = target(arg);

      const service: Services = arg.cacheClient || DEFAULT_CACHE_SERVICE;

      return new Proxy(instanceOfKnex, {
        apply(target, _, [arg]) {
          const instanceOfQueryBuilder = target(arg);

          return new Proxy(instanceOfQueryBuilder, {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            get(target: any, property) {
              const method = target[property];

              if (property === 'then') {
                return new Proxy(method, {
                  async apply(target, thisArg, [resolve, reject]) {
                    if (!instanceOfQueryBuilder._turbo)
                      return target.call(thisArg, resolve, reject);

                    const sql = instanceOfQueryBuilder.toSQL();

                    const cachedResult = await getCachedQuery(sql, service);

                    if (cachedResult) {
                      return resolve(cachedResult);
                    }

                    const result = target.call(
                      thisArg,
                      resolveWrapperToSaveInCache(resolve, sql, service),
                      reject
                    );

                    return result;
                  }
                });
              }
              return method;
            }
          });
        }
      });
    }
  });

  return knexProxy;
}
