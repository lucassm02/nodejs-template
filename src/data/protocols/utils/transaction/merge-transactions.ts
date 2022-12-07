import { Transaction } from '@/domain/models/transaction';

export type MergeTransactions = (
  transactions: (Transaction | null)[]
) => Transaction;
