import { GetCache } from '@/data/protocols/cache';
import { GetCacheValue } from '@/domain/usecases';

export class ChGetCacheValue implements GetCacheValue {
  constructor(private readonly getCache: GetCache) {}
  async get(params: GetCacheValue.Params): GetCacheValue.Result {
    const result = await this.getCache.get(params.key, params.options);

    if (params.throws && !result) {
      throw new Error(GetCacheValue.Exceptions.ERROR_ON_GET_CACHE_VALUE);
    }

    if (!result) return null;

    if (!params.options.parseBufferToString) return result;

    return result.toString();
  }
}
