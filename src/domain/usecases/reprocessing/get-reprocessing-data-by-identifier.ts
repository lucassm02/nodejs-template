import { ReprocessingModel } from '@/domain/models';

export interface GetReprocessingDataByIdentifier {
  get(
    params: GetReprocessingDataByIdentifier.Params
  ): GetReprocessingDataByIdentifier.Result;
}

export namespace GetReprocessingDataByIdentifier {
  export type Params = { reprocessingIds: string[] };
  export type Result = Promise<ReprocessingModel[]>;
  export enum Exceptions {
    REPROCESSING_DATA_NOT_FOUND = 'Reprocessing data not found.'
  }
}
