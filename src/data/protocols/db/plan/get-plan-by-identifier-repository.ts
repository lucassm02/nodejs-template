import { PlanWithDetailsModel } from '@/domain/models/plan';

export interface GetPlanByIdentifierRepository {
  getByIdentifier(
    identifier: GetPlanByIdentifierRepository.Params
  ): GetPlanByIdentifierRepository.Result;
}

export namespace GetPlanByIdentifierRepository {
  export type Params = string | number;
  export type Result = Promise<PlanWithDetailsModel>;
}
