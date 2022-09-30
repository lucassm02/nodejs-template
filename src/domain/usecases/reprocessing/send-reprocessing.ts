import { ReprocessingData } from '@/domain/models';

export interface SendReprocessing {
  reprocess(params: SendReprocessing.Params): SendReprocessing.Result;
}
export namespace SendReprocessing {
  export type Params = ReprocessingData;

  export type Result = void;
}
