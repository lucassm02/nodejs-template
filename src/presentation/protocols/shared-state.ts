import {
  ValidateTokenModel,
  AuthenticationModel,
  ExampleModel,
  DatabaseTransaction,
  CacheTransaction
} from '@/domain/models';

export type SharedState = {
  validateToken: ValidateTokenModel;
  validateAuthenticationKey: AuthenticationModel;
  getExample: ExampleModel[];
  cacheValues: CacheTransaction;
  createExample: ExampleModel;
  transactions: DatabaseTransaction[];
};
