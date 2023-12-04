import { ChSaveInCache } from '@/data/usecases/cache';
import { makeCacheServer } from '@/infra/cache';
import { SaveInCacheMiddleware } from '@/presentation/middlewares';
import { SharedState } from '@/presentation/protocols/shared-state';

import { makeErrorHandler } from '../../usecases';

type Value = keyof SharedState;
type FactoryParams<K extends Value> = {
  key: string;
  throws?: boolean;
  ttl?: number;
  value: string | K;
  extractField?: K;
};

const getExtractValue = (params: {
  field?: string;
  value: string;
}): string[] => {
  if (!params.field) {
    return [`state.${params.value}`];
  }
  return [`state.${params.value}.${params.field}`];
};

export const makeSaveInCacheMiddleware = <K extends Value>(
  params: FactoryParams<K>
) => {
  const cacheServer = makeCacheServer();

  const chSaveInCache = new ChSaveInCache(cacheServer);

  const extractValue = getExtractValue({
    field: params.extractField as string,
    value: params.value
  });

  return new SaveInCacheMiddleware(
    {
      ...params
    },
    makeErrorHandler(),
    chSaveInCache,
    extractValue
  );
};
