import {
  ValidateTokenModel,
  AuthenticationModel,
  ExampleModel,
} from '@/domain/models';
import { Transaction } from '@/domain/models/transaction';

export type SharedState = {
  validateToken: ValidateTokenModel;
  validateAuthenticationKey: AuthenticationModel;
  getExample: ExampleModel[];
  createExample: ExampleModel;
  transactions: Transaction[];
};
