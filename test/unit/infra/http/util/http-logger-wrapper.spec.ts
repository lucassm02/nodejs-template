import { httpLoggerWrapper } from '@/infra/http/util/http-logger-wrapper';
import { logger } from '@/util';

jest.mock('@/util', () => ({
  ...jest.requireActual('@/util'),
  logger: { log: jest.fn() }
}));

const mockLogger = logger as { log: jest.Mock };

const makeOptions = (overrides: Record<string, unknown> = {}) => ({
  description: 'TEST CALL',
  keywords: { env: 'test' },
  services: ['SERVICE_A'],
  request: {
    body: { foo: 'bar' },
    method: 'POST',
    headers: { 'x-auth': 'token' },
    url: '/test'
  },
  response: {
    body: { result: true },
    statusCode: 200,
    headers: { 'content-type': 'application/json' }
  },
  ...overrides
});

describe('httpLoggerWrapper', () => {
  it('should call logger.log with level http and correct description', () => {
    httpLoggerWrapper(makeOptions());

    expect(mockLogger.log).toHaveBeenCalledWith(
      expect.objectContaining({ level: 'http', message: 'TEST CALL' })
    );
  });

  it('should include request and response in payload', () => {
    httpLoggerWrapper(makeOptions());

    const call = mockLogger.log.mock.calls[0][0];
    expect(call.payload).toHaveProperty('request');
    expect(call.payload).toHaveProperty('response');
  });

  it('should wrap primitive request body in contentType object', () => {
    httpLoggerWrapper(
      makeOptions({
        request: { body: 'raw-string', method: 'POST', headers: {}, url: '/' }
      })
    );

    const call = mockLogger.log.mock.calls[0][0];
    expect(call.payload.request['request-body']).toEqual(
      expect.objectContaining({
        contentType: 'string',
        rawRequestBody: 'raw-string'
      })
    );
  });

  it('should wrap primitive response body in contentType object', () => {
    httpLoggerWrapper(
      makeOptions({ response: { body: 'raw-response', statusCode: 200 } })
    );

    const call = mockLogger.log.mock.calls[0][0];
    expect(call.payload.response['response-body']).toEqual(
      expect.objectContaining({
        contentType: 'string',
        rawResponseBody: 'raw-response'
      })
    );
  });

  it('should call logger.log with error when an exception occurs internally', () => {
    const badOptions = { ...makeOptions(), request: null } as any;
    httpLoggerWrapper(badOptions);

    expect(mockLogger.log).toHaveBeenCalled();
  });
});
