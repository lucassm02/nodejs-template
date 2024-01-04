import { SetCache } from '@/data/protocols/cache';
import { SaveInCache } from '@/domain/usecases';

export class ChSaveInCache implements SaveInCache {
  constructor(private readonly cacheRepository: SetCache) {}
  async save(params: SaveInCache.Params): SaveInCache.Result {
    await this.cacheRepository.set(params);
  }
}
