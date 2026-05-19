import { elasticSearchTransformer } from '@/util/observability/loggers/default/transformer/elasticsearch-transformer';

describe('elasticSearchTransformer', () => {
  it('should return snake_case object with correct fields', () => {
    const param = {
      level: 'info',
      message: 'test message',
      meta: {
        traceId: 'trace-123',
        transactionId: 'tx-456',
        payload: { some: 'data' },
        meta: { keywords: { env: 'test' }, services: ['API'] }
      }
    };

    const result = elasticSearchTransformer(param as any);

    expect(result).toMatchObject({
      level: 'info',
      message: 'test message',
      trace_id: 'trace-123',
      transaction_id: 'tx-456',
      payload: { some: 'data' },
      keywords: { env: 'test' },
      services: ['API']
    });
    expect(result).toHaveProperty('application');
    expect(result).toHaveProperty('created_at');
  });

  it('should default keywords to {} and services to [] when meta is missing', () => {
    const param = {
      level: 'error',
      message: 'error msg',
      meta: {}
    };

    const result = elasticSearchTransformer(param as any);

    expect(result).toMatchObject({ keywords: {}, services: [] });
  });

  it('should include application name and version from package.json', () => {
    const result = elasticSearchTransformer({
      level: 'info',
      message: 'x',
      meta: {}
    } as any);
    const app = (result as any).application;
    expect(app).toHaveProperty('name');
    expect(app).toHaveProperty('version');
  });
});
