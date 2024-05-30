import { DatabaseTransaction } from '@/domain/models';

export const databaseTransactionMock: DatabaseTransaction = {
  commit: async () => {},
  rollback: async () => {}
};
