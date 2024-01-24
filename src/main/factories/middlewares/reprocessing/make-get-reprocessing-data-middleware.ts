import { GetReprocessingDataMiddleware } from '@/presentation/middlewares';
import { DbGetReprocessingData } from '@/data/usecases/db';
import { ReprocessingRepository } from '@/infra/db/mongodb/reprocessing';

import { makeErrorHandler } from '../../usecases';

export const makeGetReprocessingDataMiddleware = () => {
  const reprocessingRepository = new ReprocessingRepository();
  const dbGetReprocessingData = new DbGetReprocessingData(
    reprocessingRepository
  );
  return new GetReprocessingDataMiddleware(
    dbGetReprocessingData,
    makeErrorHandler()
  );
};
