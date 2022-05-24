export interface ValidateTokenService {
  validate(params: ValidateTokenService.Params): ValidateTokenService.Result;
}

export namespace ValidateTokenService {
  export type Params = string;
  export type Result = Promise<boolean>;
}
