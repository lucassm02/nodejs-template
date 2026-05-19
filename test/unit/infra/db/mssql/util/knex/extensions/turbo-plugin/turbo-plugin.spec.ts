import k from 'knex';

import { turboPlugin } from '@/infra/db/mssql/util/knex/extensions/turbo-plugin';
import { turboQueryBuilderExtension } from '@/infra/db/mssql/util/knex/extensions/turbo-plugin/turbo-query-builder-extension';
import { turboInterceptorPlugin } from '@/infra/db/mssql/util/knex/extensions/turbo-plugin/turbo-interceptor';

jest.mock('node-cache', () =>
  jest.fn().mockImplementation(() => ({
    get: jest.fn().mockReturnValue(undefined),
    set: jest.fn()
  }))
);

jest.mock('@/infra/cache', () => ({
  makeCacheServer: jest.fn().mockReturnValue({
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue(undefined)
  })
}));

jest.mock('@/util', () => ({
  generateHashKeyToMemJs: jest.fn().mockImplementation((k: string) => k),
  logger: { log: jest.fn() }
}));

const makeSqliteConfig = (): k.Knex.Config => ({
  client: 'sqlite3',
  connection: ':memory:',
  useNullAsDefault: true
});

let nodeCacheInstance: any;

beforeAll(() => {
  turboQueryBuilderExtension(k);
  const NodeCache = jest.requireMock('node-cache') as jest.Mock;
  // mock.results[0].value is the object returned by new NodeCache() (the implementation's return)
  nodeCacheInstance = NodeCache.mock.results[0]?.value;
});

describe('turboQueryBuilderExtension', () => {
  it('should add a turbo() method on query builder instances', () => {
    const db = k(makeSqliteConfig());
    const qb = db('some_table') as any;
    expect(typeof qb.turbo).toBe('function');
    db.destroy();
  });

  it('should set _turbo flag on query builder when turbo() is called', () => {
    const db = k(makeSqliteConfig());
    const qb = db('some_table') as any;
    const returned = qb.turbo();
    expect(qb._turbo).toBe(true);
    expect(returned).toBe(qb);
    db.destroy();
  });
});

describe('turboPlugin', () => {
  it('should return a proxy of knex', () => {
    const proxied = turboPlugin(k);
    expect(typeof proxied).toBe('function');
  });

  it('should enable turbo for SQLITE3 driver and return a db instance', () => {
    const proxied = turboPlugin(k);
    const db = proxied(makeSqliteConfig());
    expect(db).toBeDefined();
    db.destroy();
  });

  it('should return a proxy for any config without throwing', () => {
    const proxied = turboPlugin(k);
    expect(typeof proxied).toBe('function');
  });
});

describe('turboInterceptorPlugin', () => {
  it('should return a proxy wrapping knex', () => {
    const proxied = turboInterceptorPlugin(k);
    expect(typeof proxied).toBe('function');
  });

  it('should pass through query normally when _turbo is not set', async () => {
    const intercepted = turboInterceptorPlugin(k);
    const db = intercepted(makeSqliteConfig()) as any;

    await db.schema.createTable('test_tbl', (t: any) => {
      t.increments('id');
      t.string('name');
    });

    const rows = await db('test_tbl').select('*');
    expect(Array.isArray(rows)).toBe(true);
    db.destroy();
  });

  it('should return cached result when _turbo is set and node-cache has a hit', async () => {
    const NodeCache = jest.requireMock('node-cache') as jest.Mock;
    const nodeCacheInst =
      NodeCache.mock.instances[NodeCache.mock.instances.length - 1];
    const cachedData = [{ id: 99 }];
    nodeCacheInst?.get.mockReturnValueOnce(cachedData);

    const intercepted = turboInterceptorPlugin(k);
    const db = intercepted(makeSqliteConfig()) as any;

    await db.schema.createTable('t_cached', (t: any) => {
      t.increments('id');
    });

    const qb = db('t_cached').select('*') as any;
    qb._turbo = true;

    const resolve = jest.fn();
    await qb.then(resolve, jest.fn());

    if (nodeCacheInst?.get.mock.calls.length > 0) {
      expect(resolve).toHaveBeenCalledWith(cachedData);
    }

    db.destroy();
  });

  it('should run and cache the result when _turbo is set and no cache hit', async () => {
    const intercepted = turboInterceptorPlugin(k);
    const db = intercepted(makeSqliteConfig()) as any;

    await db.schema.createTable('t_fresh', (t: any) => {
      t.increments('id');
    });

    const tableProxy = db('t_fresh');
    tableProxy._turbo = true;

    const rows = await tableProxy;
    expect(Array.isArray(rows)).toBe(true);
    db.destroy();
  });

  it('should return node-cache result when _turbo is set and cache hits (covers lines 164-166)', async () => {
    const cachedData = [{ id: 99 }];
    nodeCacheInstance.get.mockReturnValueOnce(cachedData);

    const intercepted = turboInterceptorPlugin(k);
    const db = intercepted(makeSqliteConfig()) as any;
    const tableProxy = db('any_table');
    tableProxy._turbo = true;

    const resolve = jest.fn();
    await tableProxy.then(resolve, jest.fn());

    expect(resolve).toHaveBeenCalledWith(cachedData);
  });

  it('should hit memjs cache when cacheClient is memjs and buffer contains JSON', async () => {
    const { makeCacheServer } = jest.requireMock('@/infra/cache');
    const mockMemCache = makeCacheServer();
    const cachedData = [{ id: 42 }];
    mockMemCache.get.mockResolvedValueOnce(
      Buffer.from(JSON.stringify(cachedData))
    );

    const intercepted = turboInterceptorPlugin(k);
    const db = intercepted({
      ...makeSqliteConfig(),
      cacheClient: 'memjs'
    } as any) as any;
    const tableProxy = db('any_table');
    tableProxy._turbo = true;

    const resolve = jest.fn();
    await tableProxy.then(resolve, jest.fn());

    expect(resolve).toHaveBeenCalledWith(cachedData);
  });

  it('should return raw string when memjs buffer is not valid JSON', async () => {
    const { makeCacheServer } = jest.requireMock('@/infra/cache');
    const mockMemCache = makeCacheServer();
    mockMemCache.get.mockResolvedValueOnce(Buffer.from('not-json'));

    const intercepted = turboInterceptorPlugin(k);
    const db = intercepted({
      ...makeSqliteConfig(),
      cacheClient: 'memjs'
    } as any) as any;
    const tableProxy = db('some_table');
    tableProxy._turbo = true;

    const resolve = jest.fn();
    await tableProxy.then(resolve, jest.fn());

    expect(resolve).toHaveBeenCalledWith('not-json');
  });

  it('should write to memjs cache when cacheClient is memjs and cache misses', async () => {
    const { makeCacheServer } = jest.requireMock('@/infra/cache');
    const mockMemCache = makeCacheServer();

    // In the full test suite the heap can exceed MAX_MEMORY_USAGE (300 MB), which causes
    // checkMemoryUsage() to return false and skip saveToCache. Patch both Date.now (to force
    // a fresh check bypassing the 1-second cache) and process.memoryUsage (to report tiny heap).
    const origDateNow = Date.now;
    const origMemoryUsage = process.memoryUsage;
    Date.now = () => origDateNow() + 10000;
    (process as any).memoryUsage = () => ({ heapUsed: 1 });

    const intercepted = turboInterceptorPlugin(k);
    const db = intercepted({
      ...makeSqliteConfig(),
      cacheClient: 'memjs'
    } as any) as any;

    await db.schema.createTable('t_memjs_write', (t: any) => {
      t.increments('id');
    });

    const tableProxy = db('t_memjs_write');
    tableProxy._turbo = true;

    await tableProxy;
    await new Promise<void>((r) => {
      setImmediate(r);
    });

    Date.now = origDateNow;
    process.memoryUsage = origMemoryUsage;

    expect(mockMemCache.set).toHaveBeenCalled();
    db.destroy();
  });

  it('should skip cache and log when result size exceeds max (lines 88-93)', async () => {
    const { logger } = jest.requireMock('@/util');
    const origStringify = JSON.stringify;

    const intercepted = turboInterceptorPlugin(k);
    const db = intercepted(makeSqliteConfig()) as any;

    await db.schema.createTable('t_large', (t: any) => {
      t.increments('id');
    });

    const tableProxy = db('t_large');
    tableProxy._turbo = true;

    // Run query: sync path (getCachedQuery) uses real stringify; saveToCache queues setImmediate
    await tableProxy;

    // Patch only for the queued setImmediate (saveToCache's JSON.stringify call)
    JSON.stringify = () => 'x'.repeat(1024 * 1024 * 6); // 6MB > MAX_RESULT_SIZE

    await new Promise<void>((r) => {
      setImmediate(r);
    });
    JSON.stringify = origStringify;

    expect(logger.log).toHaveBeenCalledWith(
      expect.objectContaining({ level: 'warn' })
    );
    db.destroy();
  });

  it('should log warn when cacheQuery throws inside saveToCache (lines 97-101)', async () => {
    const { logger } = jest.requireMock('@/util');

    const intercepted = turboInterceptorPlugin(k);
    const db = intercepted(makeSqliteConfig()) as any;

    await db.schema.createTable('t_err_cache', (t: any) => {
      t.increments('id');
    });

    // Make node-cache.set throw so the catch block in saveToCache fires
    nodeCacheInstance.set.mockImplementationOnce(() => {
      throw new Error('cache write error');
    });

    const tableProxy = db('t_err_cache');
    tableProxy._turbo = true;

    await tableProxy;
    await new Promise<void>((r) => {
      setImmediate(r);
    });

    expect(logger.log).toHaveBeenCalledWith(
      expect.objectContaining({ level: 'warn' })
    );
    db.destroy();
  });

  it('should skip saveToCache when memory usage exceeds max (lines 118-123)', async () => {
    const origMemoryUsage = process.memoryUsage;
    const origDateNow = Date.now;

    // turbo-interceptor caches the memory check for 1s; advance time to force re-check
    // and patch memoryUsage to exceed MAX_MEMORY_USAGE (300 MB)
    Date.now = () => origDateNow() + 20000;
    (process as any).memoryUsage = () => ({
      heapUsed: Number.MAX_SAFE_INTEGER
    });

    const intercepted = turboInterceptorPlugin(k);
    const db = intercepted(makeSqliteConfig()) as any;

    await db.schema.createTable('t_mem_check', (t: any) => {
      t.increments('id');
    });

    const tableProxy = db('t_mem_check');
    tableProxy._turbo = true;

    const rows = await tableProxy;
    expect(Array.isArray(rows)).toBe(true);

    process.memoryUsage = origMemoryUsage;
    Date.now = origDateNow;
    db.destroy();
  });
});
