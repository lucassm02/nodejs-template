export interface Transaction {
  commit: () => Promise<void>;
  rollback: () => Promise<void>;
}

export type Wrapper<Record = unknown> = {
  record: Record;
  transaction: Transaction | null;
};
