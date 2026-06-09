# Cache

The template provides two caching approaches:

- in-process memory cache with `node-cache`;
- external cache with Memcached.

## Local Cache

Use for cheap values that are local to the process and can be lost on restart. The implementation lives in `src/infra/cache/node-cache.ts`.

## Memcached

Set `MEMCACHED_ENABLED=true` to connect on bootstrap. Configure:

- `MEMCACHED_HOST`
- `MEMCACHED_PORT`
- `MEMCACHED_USER`
- `MEMCACHED_PASSWORD`
- `MEMCACHED_DEFAULT_TTL`

## Middlewares

The template includes middlewares for:

- fetching a value from cache;
- saving a value to cache.

They can be composed before/after controllers in a route.

## When to Use

- Use cache for expensive external data, metadata, and stable responses.
- Do not cache transactional data without a clear invalidation strategy.
- Always define an explicit TTL when possible.
