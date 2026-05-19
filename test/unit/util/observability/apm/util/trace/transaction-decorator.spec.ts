import { apmTransaction } from '@/util/observability/apm/util/trace/transaction-decorator';
import { elasticAPM } from '@/util/observability/apm/factory';

jest.mock('@/util/observability/apm/factory');

const mockElasticAPM = elasticAPM as jest.MockedFunction<typeof elasticAPM>;

const makeTransactionMock = () => ({
  end: jest.fn(),
  addLabels: jest.fn(),
  type: ''
});

describe('apmTransaction', () => {
  describe('without active APM', () => {
    it('should call original async method when APM is null', async () => {
      mockElasticAPM.mockReturnValue({ getAPM: () => null } as any);

      const descriptor: PropertyDescriptor = {
        value: async (x: number) => x * 3
      };
      const decorated = apmTransaction({
        options: { name: 'op', type: 'worker' }
      });
      decorated({}, 'method', descriptor);

      const result = await descriptor.value(4);
      expect(result).toBe(12);
    });

    it('should call original sync method when APM is null', () => {
      mockElasticAPM.mockReturnValue({ getAPM: () => null } as any);

      const descriptor: PropertyDescriptor = { value: (x: number) => x + 10 };
      const decorated = apmTransaction({ options: { name: 'sync-op' } });
      decorated({}, 'method', descriptor);

      expect(descriptor.value(5)).toBe(15);
    });
  });

  describe('with active APM', () => {
    it('should start and end a transaction for async method', async () => {
      const transaction = makeTransactionMock();
      mockElasticAPM.mockReturnValue({
        getAPM: () => ({
          startTransaction: jest.fn().mockReturnValue(transaction)
        })
      } as any);

      const descriptor: PropertyDescriptor = {
        value: async () => 'async-done'
      };
      const decorated = apmTransaction({
        options: { name: 'tx-op', type: 'worker' }
      });
      decorated({}, 'method', descriptor);

      const result = await descriptor.value();
      expect(result).toBe('async-done');
      expect(transaction.end).toHaveBeenCalledTimes(1);
      expect(transaction.type).toBe('worker');
    });

    it('should start and end a transaction for sync method', () => {
      const transaction = makeTransactionMock();
      mockElasticAPM.mockReturnValue({
        getAPM: () => ({
          startTransaction: jest.fn().mockReturnValue(transaction)
        })
      } as any);

      const descriptor: PropertyDescriptor = { value: () => 'sync-done' };
      const decorated = apmTransaction({ options: { name: 'sync-tx' } });
      decorated({}, 'method', descriptor);

      const result = descriptor.value();
      expect(result).toBe('sync-done');
      expect(transaction.end).toHaveBeenCalledTimes(1);
    });

    it('should add labels when params option is provided', async () => {
      const transaction = makeTransactionMock();
      mockElasticAPM.mockReturnValue({
        getAPM: () => ({
          startTransaction: jest.fn().mockReturnValue(transaction)
        })
      } as any);

      const descriptor: PropertyDescriptor = {
        value: async (name: string) => name
      };
      const decorated = apmTransaction({
        options: { nameByParameter: 0 },
        params: { name: 0 }
      });
      decorated({}, 'method', descriptor);

      await descriptor.value('my-job');
      expect(transaction.addLabels).toHaveBeenCalled();
    });

    it('should add result labels for async method', async () => {
      const transaction = makeTransactionMock();
      mockElasticAPM.mockReturnValue({
        getAPM: () => ({
          startTransaction: jest.fn().mockReturnValue(transaction)
        })
      } as any);

      const descriptor: PropertyDescriptor = {
        value: async () => ({ status: 'done' })
      };
      const decorated = apmTransaction({
        options: { name: 'op' },
        result: { status: 'status' }
      });
      decorated({}, 'method', descriptor);

      await descriptor.value();
      expect(transaction.addLabels).toHaveBeenCalled();
      expect(transaction.end).toHaveBeenCalledTimes(1);
    });

    it('should set type and add params labels for sync method', () => {
      const transaction = makeTransactionMock();
      mockElasticAPM.mockReturnValue({
        getAPM: () => ({
          startTransaction: jest.fn().mockReturnValue(transaction)
        })
      } as any);

      const descriptor: PropertyDescriptor = { value: (x: number) => x };
      const decorated = apmTransaction({
        options: { name: 'sync-tx', type: 'worker' },
        params: { value: 0 }
      });
      decorated({}, 'method', descriptor);

      descriptor.value(7);
      expect(transaction.type).toBe('worker');
      expect(transaction.addLabels).toHaveBeenCalled();
      expect(transaction.end).toHaveBeenCalledTimes(1);
    });

    it('should add result labels for sync method', () => {
      const transaction = makeTransactionMock();
      mockElasticAPM.mockReturnValue({
        getAPM: () => ({
          startTransaction: jest.fn().mockReturnValue(transaction)
        })
      } as any);

      const descriptor: PropertyDescriptor = { value: () => ({ id: 42 }) };
      const decorated = apmTransaction({
        options: { name: 'sync-tx' },
        result: { id: 'id' }
      });
      decorated({}, 'method', descriptor);

      descriptor.value();
      expect(transaction.addLabels).toHaveBeenCalled();
      expect(transaction.end).toHaveBeenCalledTimes(1);
    });
  });
});
