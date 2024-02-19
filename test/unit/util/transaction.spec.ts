import { DatabaseTransaction } from '@/domain/models';
import { mergeTransactions, rollbackAll, commitAll } from '@/util';

describe('mergeTransactions', () => {
  it('Should return rollback and commit functions', async () => {
    const transactions = [
      { rollback: jest.fn(), commit: jest.fn() } as DatabaseTransaction,
      { rollback: jest.fn(), commit: jest.fn() } as DatabaseTransaction,
      { rollback: jest.fn(), commit: jest.fn() } as DatabaseTransaction
    ];

    const { rollback, commit } = mergeTransactions(transactions);

    await rollback();
    await commit();

    transactions.forEach((transaction) => {
      expect(transaction.rollback).toHaveBeenCalledTimes(1);
      expect(transaction.commit).toHaveBeenCalledTimes(1);
    });
  });
});

describe('rollbackAll', () => {
  it('Should rollback all transactions in reverse order', async () => {
    const transactions = [
      { rollback: jest.fn() } as unknown as DatabaseTransaction,
      { rollback: jest.fn() } as unknown as DatabaseTransaction,
      { rollback: jest.fn() } as unknown as DatabaseTransaction
    ];

    await rollbackAll(transactions);

    transactions.forEach((transaction) => {
      expect(transaction.rollback).toHaveBeenCalledTimes(1);
    });
  });
});

describe('commitAll', () => {
  it('Should commit all transactions', async () => {
    const transactions = [
      { commit: jest.fn() } as unknown as DatabaseTransaction,
      { commit: jest.fn() } as unknown as DatabaseTransaction,
      { commit: jest.fn() } as unknown as DatabaseTransaction
    ];

    await commitAll(transactions);

    transactions.forEach((transaction) => {
      expect(transaction.commit).toHaveBeenCalledTimes(1);
    });
  });
});
