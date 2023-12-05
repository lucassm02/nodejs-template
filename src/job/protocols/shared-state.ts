import {
  CacheTransaction,
  ReprocessingData,
  ValidateTokenModel
} from '@/domain/models';

export type SharedState = {
  createEvent: { id: string };
  cacheValues: CacheTransaction;
  validateToken: ValidateTokenModel;
  reprocessing: ReprocessingData;
};
