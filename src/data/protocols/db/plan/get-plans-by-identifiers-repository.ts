import { PlanWithDetailsModel } from '@/domain/models/plan';

export interface GetPlansByIdentifiersRepository {
  getByIdentifiers(
    identifiers: GetPlansByIdentifiersRepository.Params
  ): GetPlansByIdentifiersRepository.Result;
}

export namespace GetPlansByIdentifiersRepository {
  export type Params = string[] | number[];
  export type Result = Promise<PlanWithDetailsModel[]>;
}
