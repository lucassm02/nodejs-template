import { PlanWithDetailsModel } from '@/domain/models';

export interface GetPlansBySourceAndMvnoRepository {
  getBySourceAndMvno(
    params: GetPlansBySourceAndMvnoRepository.Params
  ): GetPlansBySourceAndMvnoRepository.Result;
}

export namespace GetPlansBySourceAndMvnoRepository {
  export type Params = {
    mvnoId: number;
    sourceId: number;
  };

  export type Result = Promise<PlanWithDetailsModel[]>;
}
