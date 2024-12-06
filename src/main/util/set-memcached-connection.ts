import { makeCacheServer } from '@/infra/cache';
import { MEMCACHED } from '@/util';

export function setMemcachedConnection() {
  makeCacheServer().setCredentials({
    host: MEMCACHED.HOST,
    port: MEMCACHED.PORT,
    password: MEMCACHED.PASSWORD,
    user: MEMCACHED.USER
  });
}
