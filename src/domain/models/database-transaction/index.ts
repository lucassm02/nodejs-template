export interface DatabaseTransaction {
  commit: () => Promise<void>;
  rollback: () => Promise<void>;
}

export type DatabaseTransactionWrapper<Record = unknown> = {
  record: Record;
  transaction: DatabaseTransaction | null;
};
