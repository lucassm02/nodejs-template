import {
  GetPlanByIdentifierRepository,
  GetPlanDetailsByPlanIdRepository,
} from '@/data/protocols/db/plan';
import { GetPlanByIdentifier } from '@/domain/usecases/plan';

export class DbGetPlanByIdentifier implements GetPlanByIdentifier {
  constructor(
    private readonly getPlanByIdentifierRepository: GetPlanByIdentifierRepository,
    private readonly getPlanDetailsByPlanIdRepository: GetPlanDetailsByPlanIdRepository
  ) {}

  async getByExternalId(
    identifier: GetPlanByIdentifier.Params
  ): GetPlanByIdentifier.Result {
    const plan = await this.getPlanByIdentifierRepository.getByIdentifier(
      identifier
    );

    if (!plan) throw new Error(GetPlanByIdentifier.Exceptions.PLAN_NOT_FOUND);

    const details =
      await this.getPlanDetailsByPlanIdRepository.getDetailsByPlanId(
        plan.planId
      );

    return { ...plan, details };
  }
}
