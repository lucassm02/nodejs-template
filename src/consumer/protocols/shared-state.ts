import { ReprocessingData, ValidateTokenModel } from '@/domain/models';

export type SharedState = {
  validateToken?: ValidateTokenModel;
  reprocessing: ReprocessingData;
};
