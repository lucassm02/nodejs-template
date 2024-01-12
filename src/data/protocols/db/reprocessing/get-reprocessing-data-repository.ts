import { ReprocessingModel } from '@/domain/models';

export interface GetReprocessingDataRepository {
  get(
    params: GetReprocessingDataRepository.Params
  ): GetReprocessingDataRepository.Result;
}

export namespace GetReprocessingDataRepository {
  export type Params = {
    exchange?: string;
    routingKey?: string;
    queue?: string;
  };
  export type Result = Promise<ReprocessingModel[] | []>;
}
