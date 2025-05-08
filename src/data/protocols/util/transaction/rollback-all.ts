import { DatabaseTransaction } from '@/domain/models';

export type RollbackAll = (
  transactions: (DatabaseTransaction | null)[]
) => Promise<void>;
