import { GetReprocessingDataByIdentifierMiddleware } from '@/presentation/middlewares';
import { DbGetReprocessingDataByIdentifier } from '@/data/usecases/db';
import { ReprocessingRepository } from '@/infra/db/mongodb/reprocessing';

import { makeErrorHandler } from '../../usecases';

export const makeGetReprocessingDataByIdentifierMiddleware = () => {
  const reprocessingRepository = new ReprocessingRepository();
  const dbGetReprocessingDataByIdentifier =
    new DbGetReprocessingDataByIdentifier(reprocessingRepository);
  return new GetReprocessingDataByIdentifierMiddleware(
    dbGetReprocessingDataByIdentifier,
    makeErrorHandler()
  );
};
