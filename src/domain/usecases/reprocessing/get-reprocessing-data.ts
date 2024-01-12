import { ReprocessingModel } from '@/domain/models';

export interface GetReprocessingData {
  get(params: GetReprocessingData.Params): GetReprocessingData.Result;
}

export namespace GetReprocessingData {
  export type Params = {
    exchange?: string;
    routingKey?: string;
    queue?: string;
  };
  export type Result = Promise<ReprocessingModel[]>;
  export enum Exceptions {
    REPROCESSING_DATA_NOT_FOUND = 'Reprocessing data not found.'
  }
}
