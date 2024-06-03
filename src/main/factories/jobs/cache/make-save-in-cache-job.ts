import { ChSaveInCache } from '@/data/usecases/cache';
import { makeCacheServer } from '@/infra/cache';
import { SharedState } from '@/job/protocols';
import { SaveInCacheJob } from '@/job';

import { makeErrorHandler } from '../../usecases';

type Value = keyof SharedState;

type FactoryParams<K extends Value> = {
  key: string;
  subKey: keyof SharedState[K];
  throws?: boolean;
  ttl?: number;
  value: K;
  extractField?: keyof SharedState[K];
};

export const makeSaveInCacheJob = <K extends Value>(
  params: FactoryParams<K>
) => {
  const cacheServer = makeCacheServer();

  const chSaveInCache = new ChSaveInCache(cacheServer);

  const extractValues: (string | Record<string, string>)[] = [
    { field: !params.extractField ? `state.${params.value}` : '' },
    { subKey: `state.${params.value}.${String(params.subKey)}` },
    `state.${params.value}.${String(params.extractField)}`
  ];

  return new SaveInCacheJob(
    {
      ...params
    },
    makeErrorHandler(),
    chSaveInCache,
    extractValues
  );
};
