import { DeleteReprocessingByIdentifierMiddleware } from '@/presentation/middlewares';
import { DbDeleteReprocessingByIdentifier } from '@/data/usecases/db';
import { ReprocessingRepository } from '@/infra/db/mongodb/reprocessing';

import { makeErrorHandler } from '../../usecases';

export const makeDeleteReprocessingByIdentifierMiddleware = () => {
  const reprocessingRepository = new ReprocessingRepository();
  const dbDeleteReprocessingByIdentifier = new DbDeleteReprocessingByIdentifier(
    reprocessingRepository
  );
  return new DeleteReprocessingByIdentifierMiddleware(
    dbDeleteReprocessingByIdentifier,
    makeErrorHandler()
  );
};
