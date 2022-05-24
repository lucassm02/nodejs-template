import { AuthenticationModel } from '@/domain/models';

export interface ValidateAuthenticationKey {
  validate: (
    params: ValidateAuthenticationKey.Params
  ) => ValidateAuthenticationKey.Result;
}

export namespace ValidateAuthenticationKey {
  export type Params = string;
  export type Result = Promise<AuthenticationModel>;
}
