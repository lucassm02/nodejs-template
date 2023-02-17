import { DatabaseTransaction } from '@/domain/models';

export type CommitAll = (
  transactions: (DatabaseTransaction | null)[]
) => Promise<void>;
