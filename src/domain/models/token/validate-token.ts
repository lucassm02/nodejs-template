import { AccountTokenModel, ManagementTokenModel } from './token';

export type ValidateTokenModel = {
  token: AccountTokenModel & ManagementTokenModel;
  encryptedToken: string;
};
