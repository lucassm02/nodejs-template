import { ReprocessingData, ValidateTokenModel } from '@/domain/models';

export type SharedState = {
  createEvent: { id: string };
  validateToken: ValidateTokenModel;
  reprocessing: ReprocessingData;
};
