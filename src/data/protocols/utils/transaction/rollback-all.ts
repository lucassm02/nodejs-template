import { Transaction } from '@/domain/models/transaction';

export type RollbackAll = (
  transactions: (Transaction | null)[]
) => Promise<void>;
