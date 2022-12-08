import { Transaction } from '@/domain/models/transaction';

export const mergeTransactions = (transactions: (Transaction | null)[]) => {
  const orderedTransactions = transactions.reverse();

  const rollback = async () => {
    for await (const transaction of orderedTransactions) {
      await transaction?.rollback();
    }
  };

  const commit = async () => {
    for await (const transaction of orderedTransactions) {
      await transaction?.commit();
    }
  };

  return { commit, rollback };
};

export const rollbackAll = async (transactions: (Transaction | null)[]) => {
  for await (const transaction of transactions.reverse()) {
    await transaction?.rollback();
  }
};

export const commitAll = async (transactions: (Transaction | null)[]) => {
  for await (const transaction of transactions) {
    await transaction?.commit();
  }
};
