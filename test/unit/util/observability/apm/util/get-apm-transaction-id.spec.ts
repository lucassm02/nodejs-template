import { getAPMTransactionIds } from '@/util/observability/apm/util/get-apm-transaction-id';
import { elasticAPM } from '@/util/observability/apm/factory';

jest.mock('@/util/observability/apm/factory');

const mockElasticAPM = elasticAPM as jest.MockedFunction<typeof elasticAPM>;

describe('getAPMTransactionIds', () => {
  it('should return null when there is no current transaction', () => {
    mockElasticAPM.mockReturnValue({ getAPM: () => null } as any);
    const result = getAPMTransactionIds();
    expect(result).toBeNull();
  });

  it('should return null when APM has no currentTransaction', () => {
    mockElasticAPM.mockReturnValue({
      getAPM: () => ({ currentTransaction: null })
    } as any);
    const result = getAPMTransactionIds();
    expect(result).toBeNull();
  });

  it('should return traceId and transactionId when transaction exists', () => {
    mockElasticAPM.mockReturnValue({
      getAPM: () => ({
        currentTransaction: {
          ids: { 'trace.id': 'trace-abc', 'transaction.id': 'tx-123' }
        }
      })
    } as any);

    const result = getAPMTransactionIds();
    expect(result).toEqual({ traceId: 'trace-abc', transactionId: 'tx-123' });
  });
});
