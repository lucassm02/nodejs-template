import { DetailModel } from '@/domain/models/plan';

export interface GetPlanDetailsByPlanIdRepository {
  getDetailsByPlanId(
    planId: GetPlanDetailsByPlanIdRepository.Params
  ): GetPlanDetailsByPlanIdRepository.Result;
}

export namespace GetPlanDetailsByPlanIdRepository {
  export type Params = number;
  export type Result = Promise<DetailModel[]>;
}
