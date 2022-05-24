import { PlanWithDetailsModel } from '@/domain/models';

export interface GetPlansBySourceAndMvno {
  get: (
    params: GetPlansBySourceAndMvno.Params
  ) => GetPlansBySourceAndMvno.Result;
}

export namespace GetPlansBySourceAndMvno {
  export type Params = {
    sourceId: number;
    mvnoId: number;
  };
  export type Result = Promise<PlanWithDetailsModel[]>;
  export enum Exceptions {
    PLANS_NOT_FOUND = 'Plan not found, please check your identifier',
  }
}
