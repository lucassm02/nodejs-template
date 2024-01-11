import { DeleteProcessingByIdentifierMiddleware } from '@/presentation/middlewares';
import { DbDeleteProcessingByIdentifier } from '@/data/usecases/db';
import { ReprocessingRepository } from '@/infra/db/mongodb/reprocessing';

import { makeErrorHandler } from '../../usecases';

export const makeDeleteProcessingByIdentifierMiddleware = () => {
  const reprocessingRepository = new ReprocessingRepository();
  const deleteProcessingByIdentifier = new DbDeleteProcessingByIdentifier(
    reprocessingRepository
  );
  return new DeleteProcessingByIdentifierMiddleware(
    deleteProcessingByIdentifier,
    makeErrorHandler()
  );
};
