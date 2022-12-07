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

export const rollbackAll = (transactions: (Transaction | null)[]) => {
  transactions
    .reverse()
    .forEach(async (transaction) => transaction?.rollback());
};

export const commitAll = (transactions: (Transaction | null)[]) => {
  transactions.reverse().forEach(async (transaction) => transaction?.commit());
};
