import { Transaction } from '@/domain/models/transaction';

export type CommitAll = (transactions: (Transaction | null)[]) => Promise<void>;
