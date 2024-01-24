import { ReprocessingModel } from '@/domain/models';

export interface GetReprocessingDataByIdentifierRepository {
  getByIdentifier(
    params: GetReprocessingDataByIdentifierRepository.Params
  ): GetReprocessingDataByIdentifierRepository.Result;
}

export namespace GetReprocessingDataByIdentifierRepository {
  export type Params = { reprocessingIds: string[] };
  export type Result = Promise<ReprocessingModel[] | []>;
}
