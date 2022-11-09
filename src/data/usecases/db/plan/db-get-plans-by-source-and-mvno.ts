import {
  GetPlanDetailsByPlanIdRepository,
  GetPlansBySourceAndMvnoRepository,
} from '@/data/protocols/db/plan';
import { GetPlansBySourceAndMvno } from '@/domain/usecases/plan';

export class DbGetPlansBySourceAndMvno implements GetPlansBySourceAndMvno {
  constructor(
    private readonly getPlansBySourceAndMvnoRepository: GetPlansBySourceAndMvnoRepository,
    private readonly getPlanDetailsByPlanIdRepository: GetPlanDetailsByPlanIdRepository
  ) {}

  async get(
    params: GetPlansBySourceAndMvno.Params
  ): GetPlansBySourceAndMvno.Result {
    const plans =
      await this.getPlansBySourceAndMvnoRepository.getBySourceAndMvno(params);

    if (plans.length === 0)
      throw new Error(GetPlansBySourceAndMvno.Exceptions.PLANS_NOT_FOUND);

    const plansWithServicesPromise = plans.map(async (plan) => {
      const details =
        await this.getPlanDetailsByPlanIdRepository.getDetailsByPlanId(
          plan.planId
        );

      return { ...plan, details };
    });

    return Promise.all(plansWithServicesPromise);
  }
}
