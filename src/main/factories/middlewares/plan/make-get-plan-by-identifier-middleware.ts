import { DbGetPlanByIdentifier } from '@/data/usecases/db/plan';
import { PlanRepository } from '@/infra/db/mssql/plan/plan-repository';
import { GetPlanByIdentifierMiddleware } from '@/presentation/middlewares/plan';
import { logger } from '@/util';

import { makeErrorHandler } from '../../usecases';

export const makeGetPlanByIdentifierMiddleware = () => {
  const verifyPlanRepository = new PlanRepository();

  const dbGetPlanByIdentifier = new DbGetPlanByIdentifier(
    verifyPlanRepository,
    verifyPlanRepository
  );

  return new GetPlanByIdentifierMiddleware(
    dbGetPlanByIdentifier,
    logger,
    makeErrorHandler()
  );
};
