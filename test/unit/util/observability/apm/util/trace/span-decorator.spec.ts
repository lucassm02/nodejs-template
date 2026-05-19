import { apmSpan } from '@/util/observability/apm/util/trace/span-decorator';
import { elasticAPM } from '@/util/observability/apm/factory';

jest.mock('@/util/observability/apm/factory');

const mockElasticAPM = elasticAPM as jest.MockedFunction<typeof elasticAPM>;

const makeSpanMock = () => ({
  end: jest.fn(),
  addLabels: jest.fn(),
  type: '',
  subtype: ''
});

const makeTransactionMock = (
  span: ReturnType<typeof makeSpanMock> | null = makeSpanMock()
) => ({
  startSpan: jest.fn().mockReturnValue(span)
});

describe('apmSpan', () => {
  describe('without active APM transaction', () => {
    it('should call original async method without instrumentation', async () => {
      mockElasticAPM.mockReturnValue({
        getAPM: () => ({ currentTransaction: null })
      } as any);

      const descriptor: PropertyDescriptor = {
        value: async (x: number) => x * 2
      };
      const decorated = apmSpan({
        options: { name: 'op', subType: 'handler' }
      });
      decorated({}, 'method', descriptor);

      const result = await descriptor.value(5);
      expect(result).toBe(10);
    });

    it('should call original sync method without instrumentation', () => {
      mockElasticAPM.mockReturnValue({
        getAPM: () => ({ currentTransaction: null })
      } as any);

      const descriptor: PropertyDescriptor = { value: (x: number) => x + 1 };
      const decorated = apmSpan({
        options: { name: 'op', subType: 'handler' }
      });
      decorated({}, 'method', descriptor);

      expect(descriptor.value(3)).toBe(4);
    });
  });

  describe('with active APM transaction', () => {
    it('should start and end a span for async method', async () => {
      const span = makeSpanMock();
      const transaction = makeTransactionMock(span);
      mockElasticAPM.mockReturnValue({
        getAPM: () => ({ currentTransaction: transaction })
      } as any);

      const descriptor: PropertyDescriptor = { value: async () => 'done' };
      const decorated = apmSpan({
        options: { name: 'async-op', subType: 'http' }
      });
      decorated({}, 'method', descriptor);

      const result = await descriptor.value();
      expect(result).toBe('done');
      expect(span.end).toHaveBeenCalledTimes(1);
      expect(span.subtype).toBe('http');
    });

    it('should end span even on error in async method', async () => {
      const span = makeSpanMock();
      const transaction = makeTransactionMock(span);
      mockElasticAPM.mockReturnValue({
        getAPM: () => ({ currentTransaction: transaction })
      } as any);

      const descriptor: PropertyDescriptor = {
        value: async () => {
          throw new Error('fail');
        }
      };
      const decorated = apmSpan({
        options: { name: 'err-op', subType: 'handler' }
      });
      decorated({}, 'method', descriptor);

      await expect(descriptor.value()).rejects.toThrow('fail');
      expect(span.end).toHaveBeenCalledTimes(1);
    });

    it('should call original method when span cannot be created', async () => {
      const transaction = makeTransactionMock(null);
      mockElasticAPM.mockReturnValue({
        getAPM: () => ({ currentTransaction: transaction })
      } as any);

      const descriptor: PropertyDescriptor = { value: async () => 'no-span' };
      const decorated = apmSpan({
        options: { name: 'op', subType: 'handler' }
      });
      decorated({}, 'method', descriptor);

      const result = await descriptor.value();
      expect(result).toBe('no-span');
    });

    it('should start and end a span for sync method', () => {
      const span = makeSpanMock();
      const transaction = makeTransactionMock(span);
      mockElasticAPM.mockReturnValue({
        getAPM: () => ({ currentTransaction: transaction })
      } as any);

      const descriptor: PropertyDescriptor = { value: () => 'sync-result' };
      const decorated = apmSpan({
        options: { name: 'sync-op', subType: 'function' }
      });
      decorated({}, 'method', descriptor);

      const result = descriptor.value();
      expect(result).toBe('sync-result');
      expect(span.end).toHaveBeenCalledTimes(1);
    });

    it('should add labels from params for async method', async () => {
      const span = makeSpanMock();
      const transaction = makeTransactionMock(span);
      mockElasticAPM.mockReturnValue({
        getAPM: () => ({ currentTransaction: transaction })
      } as any);

      const descriptor: PropertyDescriptor = {
        value: async (name: string) => name
      };
      const decorated = apmSpan({
        options: { name: 'op', subType: 'handler' },
        params: { name: 0 }
      });
      decorated({}, 'method', descriptor);

      await descriptor.value('test-value');
      expect(span.addLabels).toHaveBeenCalled();
    });

    it('should add labels from result for async method', async () => {
      const span = makeSpanMock();
      const transaction = makeTransactionMock(span);
      mockElasticAPM.mockReturnValue({
        getAPM: () => ({ currentTransaction: transaction })
      } as any);

      const descriptor: PropertyDescriptor = {
        value: async () => ({ status: 'ok' })
      };
      const decorated = apmSpan({
        options: { name: 'op' },
        result: { status: 'status' }
      });
      decorated({}, 'method', descriptor);

      await descriptor.value();
      expect(span.addLabels).toHaveBeenCalled();
      expect(span.end).toHaveBeenCalledTimes(1);
    });

    it('should add labels from params for sync method', () => {
      const span = makeSpanMock();
      const transaction = makeTransactionMock(span);
      mockElasticAPM.mockReturnValue({
        getAPM: () => ({ currentTransaction: transaction })
      } as any);

      const descriptor: PropertyDescriptor = { value: (x: number) => x };
      const decorated = apmSpan({
        options: { name: 'sync-op', subType: 'function' },
        params: { value: 0 }
      });
      decorated({}, 'method', descriptor);

      descriptor.value(42);
      expect(span.addLabels).toHaveBeenCalled();
    });

    it('should add labels from result for sync method', () => {
      const span = makeSpanMock();
      const transaction = makeTransactionMock(span);
      mockElasticAPM.mockReturnValue({
        getAPM: () => ({ currentTransaction: transaction })
      } as any);

      const descriptor: PropertyDescriptor = { value: () => ({ id: 1 }) };
      const decorated = apmSpan({
        options: { name: 'sync-op' },
        result: { id: 'id' }
      });
      decorated({}, 'method', descriptor);

      descriptor.value();
      expect(span.addLabels).toHaveBeenCalled();
      expect(span.end).toHaveBeenCalledTimes(1);
    });

    it('should call original sync method when span cannot be created', () => {
      const transaction = makeTransactionMock(null);
      mockElasticAPM.mockReturnValue({
        getAPM: () => ({ currentTransaction: transaction })
      } as any);

      const descriptor: PropertyDescriptor = { value: () => 'no-span-sync' };
      const decorated = apmSpan({ options: { name: 'op' } });
      decorated({}, 'method', descriptor);

      expect(descriptor.value()).toBe('no-span-sync');
    });
  });
});
