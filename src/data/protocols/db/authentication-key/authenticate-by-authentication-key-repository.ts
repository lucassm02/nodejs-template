export interface AuthenticateByAuthenticationKey {
  authenticate(
    authentication: string
  ): Promise<AuthenticateByAuthenticationKey.Result>;
}

export namespace AuthenticateByAuthenticationKey {
  export type Result = {
    mobileOperatorId: number;
  };
}
