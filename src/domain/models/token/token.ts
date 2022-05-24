type Payload = {
  userId: number;
  customerId: number;
  accountId: number;
  msisdn: string;
  mvnoId: number;
  sourceId: number;
  sourceMvnoId: number;
  telecall: {
    subscriptionId: string;
    customerId: string;
  };
};

type BaseTokenData = {
  id: string;
  type: number;
  issuedAt: number;
  expiresAt: number;
};

export type AccountTokenPayloadModel = Omit<Payload, 'userId'>;

export type ManagementTokenPayloadModel = Omit<
  Payload,
  'customerId' | 'accountId' | 'msisdn' | 'telecall'
>;

export type SystemTokenPayloadModel = Omit<
  Payload,
  'customerId' | 'accountId' | 'msisdn' | 'telecall' | 'userId'
>;

export type AccountTokenModel = BaseTokenData & {
  payload: AccountTokenPayloadModel;
};

export type ManagementTokenModel = BaseTokenData & {
  payload: ManagementTokenPayloadModel;
};

export type SystemTokenModel = BaseTokenData & {
  payload: SystemTokenPayloadModel;
};

export enum TokenType {
  ACCOUNT = 1,
  MANAGEMENT = 2,
  SYSTEM = 3,
}
