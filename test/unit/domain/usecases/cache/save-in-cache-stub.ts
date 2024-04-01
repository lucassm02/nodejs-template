import { SaveInCache } from '@/domain/usecases';

export class SaveInCacheStub implements SaveInCache {
  save(): SaveInCache.Result {
    return Promise.resolve();
  }
}
