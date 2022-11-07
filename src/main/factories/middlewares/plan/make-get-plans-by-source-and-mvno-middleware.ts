import { DbGetPlansBySourceAndMvno } from '@/data/usecases/db/plan';
import { PlanRepository } from '@/infra/db/mssql/plan/plan-repository';
import { GetPlansBySourceAndMvnoMiddleware } from '@/presentation/middlewares';
import { logger } from '@/util';

import { makeErrorHandler } from '../../usecases';

export const makeGetPlansBySourceAndMvnoMiddleware = () => {
  const verifyPlanRepository = new PlanRepository();

  const dbGetPlanByIdentifier = new DbGetPlansBySourceAndMvno(
    verifyPlanRepository,
    verifyPlanRepository
  );

  return new GetPlansBySourceAndMvnoMiddleware(
    dbGetPlanByIdentifier,
    logger,
    makeErrorHandler()
  );
};
