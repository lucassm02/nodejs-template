import { Repository } from '@/infra/db/mssql/util/repository';
import { sqlConnection } from '@/infra/db/mssql/util/connection';

jest.mock('@/infra/db/mssql/util/connection', () => ({
  sqlConnection: {
    transaction: jest.fn(),
    raw: jest.fn()
  }
}));

const sqlConnectionMock = sqlConnection as any;

const makeTransactionConn = () => ({
  commit: jest.fn().mockResolvedValue(undefined),
  rollback: jest.fn().mockResolvedValue(undefined)
});

class TestRepository extends Repository {
  async testGetConnection() {
    return this.getConnection();
  }
  testTransactionAdapter(conn: Record<string, any>) {
    return this.transactionAdapter(conn);
  }
}

describe('Repository', () => {
  describe('constructor', () => {
    it('should set connection to sqlConnection', () => {
      const repo = new TestRepository();
      expect(repo.connection).toBe(sqlConnectionMock);
    });
  });

  describe('#getConnection', () => {
    it('should return sqlConnection directly when useTransaction is false', async () => {
      const repo = new TestRepository(false);
      const conn = await repo.testGetConnection();
      expect(conn).toBe(sqlConnectionMock);
      expect(sqlConnectionMock.transaction).not.toHaveBeenCalled();
    });

    it('should call sqlConnection.transaction when useTransaction is true', async () => {
      const transactionConn = makeTransactionConn();
      sqlConnectionMock.transaction.mockResolvedValueOnce(transactionConn);

      const repo = new TestRepository(true);
      const conn = await repo.testGetConnection();

      expect(sqlConnectionMock.transaction).toHaveBeenCalledTimes(1);
      expect(conn).toBe(transactionConn);
    });
  });

  describe('#transactionAdapter', () => {
    it('should return adapter with commit and rollback when connection has both methods', () => {
      const repo = new TestRepository();
      const conn = makeTransactionConn();
      const adapter = repo.testTransactionAdapter(conn);

      expect(adapter).not.toBeNull();
      expect(typeof adapter!.commit).toBe('function');
      expect(typeof adapter!.rollback).toBe('function');
    });

    it('should call connection.commit when adapter.commit is invoked', async () => {
      const repo = new TestRepository();
      const conn = makeTransactionConn();
      const adapter = repo.testTransactionAdapter(conn);

      await adapter!.commit();
      expect(conn.commit).toHaveBeenCalledTimes(1);
    });

    it('should call connection.rollback when adapter.rollback is invoked', async () => {
      const repo = new TestRepository();
      const conn = makeTransactionConn();
      const adapter = repo.testTransactionAdapter(conn);

      await adapter!.rollback();
      expect(conn.rollback).toHaveBeenCalledTimes(1);
    });

    it('should return null when connection does not have commit/rollback', () => {
      const repo = new TestRepository();
      const adapter = repo.testTransactionAdapter({
        someOtherMethod: jest.fn()
      });
      expect(adapter).toBeNull();
    });
  });
});
