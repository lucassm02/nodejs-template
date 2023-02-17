import {
  ValidateTokenModel,
  AuthenticationModel,
  ExampleModel,
  DatabaseTransaction,
} from '@/domain/models';

export type SharedState = {
  validateToken: ValidateTokenModel;
  validateAuthenticationKey: AuthenticationModel;
  getExample: ExampleModel[];
  createExample: ExampleModel;
  transactions: DatabaseTransaction[];
};
