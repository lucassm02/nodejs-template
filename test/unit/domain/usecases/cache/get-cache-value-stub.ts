import { GetCacheValue } from '@/domain/usecases';

export class GetCacheValueStub implements GetCacheValue {
  get(): GetCacheValue.Result {
    return Promise.resolve('my cache value');
  }
}
