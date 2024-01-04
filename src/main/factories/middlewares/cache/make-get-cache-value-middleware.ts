import { ChGetCacheValue } from '@/data/usecases/cache';
import { makeCacheServer } from '@/infra/cache';
import { GetCacheValueMiddleware } from '@/presentation/middlewares';
import { logger } from '@/util';

import { makeErrorHandler } from '../../usecases';

type FactoryParams = {
  key: string;
  throws?: boolean;
  options?: { parseToJson?: boolean; parseBufferToString?: boolean };
};

export const makeGetCacheValueMiddleware = (params: FactoryParams) => {
  const chGetCacheValue = new ChGetCacheValue(makeCacheServer());
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
    makeErrorHandler()
  );
};
