import { PlanWithDetailsModel } from '@/domain/models';

export interface GetPlanByIdentifier {
  getByExternalId: (
    identifier: GetPlanByIdentifier.Params
  ) => GetPlanByIdentifier.Result;
}

export namespace GetPlanByIdentifier {
  export type Params = string;
  export type Result = Promise<PlanWithDetailsModel>;
  export enum Exceptions {
    PLAN_NOT_FOUND = 'Plan not found, please check your identifier',
  }
}
