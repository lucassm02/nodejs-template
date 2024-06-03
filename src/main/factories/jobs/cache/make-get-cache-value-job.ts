import { ChGetCacheValue } from '@/data/usecases/cache';
import { makeCacheServer } from '@/infra/cache';
import { logger } from '@/util';
import { GetCacheValueMiddleware } from '@/presentation/middlewares';
import { SharedState } from '@/job/protocols';

import { makeErrorHandler } from '../../usecases';

type Value = keyof SharedState;

type FactoryParams<K extends Value> = {
  key: string;
  throws?: boolean;
  value: K;
  subKey: keyof SharedState[K];
  options?: { parseToJson?: boolean; parseBufferToString?: boolean };
};

export const makeGetCacheValueJob = <K extends Value>(
  params: FactoryParams<K>
) => {
  const chGetCacheValue = new ChGetCacheValue(makeCacheServer());

  const extractValues: Record<string, string>[] = [
    { subKey: `state.${params.value}.${String(params.subKey)}` }
  ];

  return new GetCacheValueMiddleware(
    {
      key: params.key,
      throws: params.throws ?? false,
      options: {
        parseToJson: params.options?.parseToJson ?? false,
        parseBufferToString: params.options?.parseBufferToString ?? false
      }
    },
    chGetCacheValue,
    logger,
    makeErrorHandler(),
    extractValues
  );
};
