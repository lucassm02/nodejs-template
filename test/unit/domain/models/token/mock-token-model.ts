import {
  AccountTokenModel,
  ManagementTokenModel,
  SystemTokenModel
} from '@/domain/models';

export const mockTokenModel: AccountTokenModel &
  SystemTokenModel &
  ManagementTokenModel = {
  id: 'any_id',
  type: 0,
  issuedAt: 0,
  expiresAt: 0,
  payload: {
    accountId: 0,
    customerId: 0,
    msisdn: 'any_msisdn',
    mvnoId: 0,
    sourceId: 0,
    sourceMvnoId: 0,
    telecall: {
      customerId: 'any_customer_id',
      subscriptionId: 'any_subscription_id'
    },
    userId: 0
  }
};
