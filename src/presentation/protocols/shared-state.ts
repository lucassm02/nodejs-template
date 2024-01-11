import {
  ValidateTokenModel,
  AuthenticationModel,
  ExampleModel,
  DatabaseTransaction,
  CacheTransaction,
  ReprocessingModel
} from '@/domain/models';

export type SharedState = {
  validateToken: ValidateTokenModel;
  validateAuthenticationKey: AuthenticationModel;
  getExample: ExampleModel[];
  cacheValues: CacheTransaction;
  createExample: ExampleModel;
  transactions: DatabaseTransaction[];
  getReprocessingDataByIdentifier: ReprocessingModel[];
};
