import { SetCache } from '@/data/protocols/cache';
import { SaveInCache } from '@/domain/usecases';

export class ChSaveInCache implements SaveInCache {
  constructor(private readonly cacheRepository: SetCache) {}
  async save(params: SaveInCache.Params): SaveInCache.Result {
    const subKeyToBuffer = btoa(String(params.subKey));
    const key = `${params.key}.${subKeyToBuffer}`;

    await this.cacheRepository.set({
      key,
      value: params.value,
      ttl: params.ttl
    });
  }
}
