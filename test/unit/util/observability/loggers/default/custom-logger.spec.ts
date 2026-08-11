import { CustomLogger } from '@/util/observability/loggers/default/custom-logger';

jest.mock('winston', () => ({
  createLogger: jest.fn().mockImplementation(() => ({
    add: jest.fn(),
    log: jest.fn()
  })),
  format: {
    combine: jest.fn((...args) => args),
    timestamp: jest.fn().mockReturnValue('ts-format'),
    colorize: jest.fn().mockReturnValue('colorize-format'),
    printf: jest.fn().mockReturnValue('printf-format'),
    json: jest.fn().mockReturnValue('json-format'),
    errors: jest.fn().mockReturnValue('errors-format'),
    splat: jest.fn().mockReturnValue('splat-format'),
    simple: jest.fn().mockReturnValue('simple-format'),
    label: jest.fn().mockReturnValue('label-format'),
    metadata: jest.fn().mockReturnValue('metadata-format')
  },
  transports: {
    Console: jest.fn()
  }
}));

jest.mock('mongoose', () => ({
  __esModule: true,
  default: { connection: { readyState: 1 } }
}));

jest.mock('winston-daily-rotate-file', () => jest.fn());
jest.mock('winston-elasticsearch', () => ({
  ElasticsearchTransport: jest.fn()
}));
jest.mock('@elastic/ecs-winston-format', () =>
  jest.fn().mockReturnValue('ecs-format')
);

jest.mock('@/util/constants', () => ({
  ...jest.requireActual('@/util/constants'),
  LOGGER: {
    ENABLED: true,
    CONSOLE: { LEVEL: 'info' },
    DB: { ENABLED: false }
  },
  ELASTICSEARCH: { ENABLED: false, SERVER_URL: '', USERNAME: '', PASSWORD: '' },
  MONGO: { ENABLED: true }
}));

jest.mock('@/main/facades', () => ({ createMongoLog: jest.fn() }));

jest.mock('@/util/observability/apm', () => ({
  elasticAPM: jest.fn().mockReturnValue({ getAPM: () => null }),
  getAPMTransactionIds: jest.fn().mockReturnValue(null)
}));

jest.mock('@/util/observability/loggers/default/transports', () => ({
  GenericTransport: jest.fn()
}));

jest.mock('@/util/security/sanitize-object', () => ({
  sanitizeObject: jest.fn().mockImplementation((obj) => obj)
}));

const getWinston = () => jest.requireMock('winston');
const getConstants = () => jest.requireMock('@/util/constants');
const getAPMModule = () => jest.requireMock('@/util/observability/apm');
const getMongoose = () => jest.requireMock('mongoose').default;

const getLoggerInstances = () => {
  const { createLogger } = getWinston();
  const [logger, offlineLogger] = (createLogger as jest.Mock).mock.results
    .slice(-2)
    .map(({ value }) => value);

  return { logger, offlineLogger };
};

beforeEach(() => {
  (CustomLogger as any).instance = undefined;
  getConstants().LOGGER.ENABLED = true;
  getConstants().LOGGER.DB.ENABLED = false;
  getConstants().ELASTICSEARCH.ENABLED = false;
  getConstants().MONGO.ENABLED = true;
  getMongoose().connection.readyState = 1;
  getAPMModule().elasticAPM.mockReturnValue({ getAPM: () => null });
  getAPMModule().getAPMTransactionIds.mockReturnValue(null);
});

type SutTypes = { sut: CustomLogger };
const makeSut = (): SutTypes => ({ sut: new CustomLogger() });

describe('CustomLogger', () => {
  describe('getInstance', () => {
    it('should return the same instance on multiple calls', () => {
      const a = CustomLogger.getInstance();
      const b = CustomLogger.getInstance();
      expect(a).toBe(b);
    });
  });

  describe('constructor', () => {
    it('should not create transports when LOGGER.ENABLED is false', () => {
      getConstants().LOGGER.ENABLED = false;
      const { createLogger } = getWinston();
      (createLogger as jest.Mock).mockClear();
      makeSut();
      expect(createLogger).not.toHaveBeenCalled();
    });

    it('should create logger when LOGGER.ENABLED is true', () => {
      const { createLogger } = getWinston();
      (createLogger as jest.Mock).mockClear();
      makeSut();
      expect(createLogger).toHaveBeenCalled();
    });

    it('should add ElasticsearchTransport when ELASTICSEARCH.ENABLED is true', () => {
      getConstants().ELASTICSEARCH.ENABLED = true;
      const { ElasticsearchTransport } = jest.requireMock(
        'winston-elasticsearch'
      );
      makeSut();
      expect(ElasticsearchTransport).toHaveBeenCalled();
    });

    it('should add GenericTransport when LOGGER.DB.ENABLED is true', () => {
      getConstants().LOGGER.DB.ENABLED = true;
      const { GenericTransport } = jest.requireMock(
        '@/util/observability/loggers/default/transports'
      );
      (GenericTransport as jest.Mock).mockClear();
      makeSut();
      expect(GenericTransport).toHaveBeenCalled();
    });
  });

  describe('#log', () => {
    it('should do nothing when LOGGER.ENABLED is false', () => {
      getConstants().LOGGER.ENABLED = false;
      const { createLogger } = getWinston();
      (createLogger as jest.Mock).mockClear();
      const { sut } = makeSut();
      sut.log({ level: 'info', message: 'test' });
      expect(createLogger).not.toHaveBeenCalled();
    });

    it('should log params object with main logger when MONGO is enabled', () => {
      const { sut } = makeSut();
      sut.log({ level: 'info', message: 'hello' });
      const { logger, offlineLogger } = getLoggerInstances();
      expect(logger.log).toHaveBeenCalledWith(
        expect.objectContaining({ level: 'info', message: 'hello' })
      );
      expect(offlineLogger.log).not.toHaveBeenCalled();
    });

    it('should use offlineLogger when MONGO.ENABLED is false', () => {
      getConstants().MONGO.ENABLED = false;
      const { sut } = makeSut();
      sut.log({ level: 'warn', message: 'offline-msg' });
      const { logger, offlineLogger } = getLoggerInstances();
      expect(offlineLogger.log).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'offline-msg' })
      );
      expect(logger.log).not.toHaveBeenCalled();
    });

    it('should use offlineLogger when MongoDB is disconnected', () => {
      getMongoose().connection.readyState = 0;
      const { sut } = makeSut();

      sut.log({ level: 'warn', message: 'mongo-disconnected' });

      const { logger, offlineLogger } = getLoggerInstances();
      expect(offlineLogger.log).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'mongo-disconnected' })
      );
      expect(logger.log).not.toHaveBeenCalled();
    });

    it('should check the MongoDB connection state on every log call', () => {
      const { sut } = makeSut();
      const { logger, offlineLogger } = getLoggerInstances();

      sut.log({ level: 'info', message: 'while-connected' });

      getMongoose().connection.readyState = 0;
      sut.log({ level: 'warn', message: 'while-disconnected' });

      getMongoose().connection.readyState = 1;
      sut.log({ level: 'info', message: 'after-reconnection' });

      expect(offlineLogger.log).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'while-disconnected' })
      );
      expect(logger.log).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'while-connected' })
      );
      expect(logger.log).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'after-reconnection' })
      );
    });

    it('should use offlineLogger when type is offline', () => {
      const { sut } = makeSut();
      sut.log({ level: 'warn', message: 'offline-type' }, 'offline');
      const { offlineLogger } = getLoggerInstances();
      expect(offlineLogger.log).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'offline-type' })
      );
    });

    it('should log Error instance at error level', () => {
      const { sut } = makeSut();
      const error = new Error('something broke');
      sut.log(error);
      const { logger } = getLoggerInstances();
      expect(logger.log).toHaveBeenCalledWith(
        expect.objectContaining({ level: 'error', message: 'something broke' })
      );
    });

    it('should log error with stack trace when logging an Error instance', () => {
      const { sut } = makeSut();
      const error = new Error('stack-error');
      sut.log(error);
      const { logger } = getLoggerInstances();
      expect(logger.log).toHaveBeenCalledWith(
        expect.objectContaining({ stack: expect.any(String) })
      );
    });

    it('should include traceId and transactionId in log when APM provides them', () => {
      getAPMModule().getAPMTransactionIds.mockReturnValue({
        traceId: 'trace-abc',
        transactionId: 'tx-xyz'
      });
      const { sut } = makeSut();
      sut.log({ level: 'info', message: 'traced' });
      const { logger } = getLoggerInstances();
      expect(logger.log).toHaveBeenCalledWith(
        expect.objectContaining({
          traceId: 'trace-abc',
          transactionId: 'tx-xyz'
        })
      );
    });

    it('should spread extra fields from log params', () => {
      const { sut } = makeSut();
      sut.log({
        level: 'debug',
        message: 'with-payload',
        payload: { key: 'val' }
      });
      const { logger } = getLoggerInstances();
      expect(logger.log).toHaveBeenCalledWith(
        expect.objectContaining({ level: 'debug', message: 'with-payload' })
      );
    });
  });
});
