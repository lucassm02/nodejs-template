import {
  AccountTokenModel,
  ManagementTokenModel,
  SystemTokenModel,
} from '@/domain/models/token';

export interface DecryptToken {
  decrypt(params: DecryptToken.Params): DecryptToken.Result;
}

export namespace DecryptToken {
  export type Params = string;
  export type Result = AccountTokenModel &
    ManagementTokenModel &
    SystemTokenModel;
}
