import {
  AccountTokenModel,
  SystemTokenModel,
  ManagementTokenModel,
} from '@/domain/models/token';

export interface ValidateToken {
  validate: (params: ValidateToken.Params) => ValidateToken.Result;
}

export namespace ValidateToken {
  export type Params = string;
  export type Result = Promise<
    AccountTokenModel & SystemTokenModel & ManagementTokenModel
  >;
  export enum Exceptions {
    ERROR_ON_DECRYPTING = 'error:0606506D:digital envelope routines:EVP_DecryptFinal_ex:wrong final block length',
    INVALID_TOKEN = 'Invalid or expired token',
  }
}
