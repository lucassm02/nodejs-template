import { DatabaseTransaction } from '@/domain/models';

export type MergeTransactions = (
  transactions: (DatabaseTransaction | null)[]
) => DatabaseTransaction;
