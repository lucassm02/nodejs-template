import { Logger } from '@/data/protocols/utils';
import { ErrorHandler, GetCacheValue } from '@/domain/usecases';
import { GetCacheValueMiddleware } from '@/presentation/middlewares';
import { SharedState } from '@/job/protocols';
import { GetCacheValueStub } from '@/test/unit/domain/usecases';
import { ErrorHandlerStub, LoggerStub } from '@/test/util';

type SutTypes = {
  sut: GetCacheValueMiddleware;
  getCacheValueStub: GetCacheValue;
  logger: Logger;
  errorHandler: ErrorHandler;
};

type Value = keyof SharedState;

type FactoryParams<K extends Value> = {
  key: string;
  throws?: boolean;
  value: K;
  subKey: keyof SharedState[K];
  options?: { parseToJson?: boolean; parseBufferToString?: boolean };
};

const makeSut = <K extends Value>(params: FactoryParams<K>): SutTypes => {
  const getCacheValueStub = new GetCacheValueStub();
  const errorHandler = new ErrorHandlerStub();
  const logger = new LoggerStub();

  const extractValues: Record<string, string>[] = [
    { subKey: `state.${params.value}.${String(params.subKey)}` }
  ];

  const sut = new GetCacheValueMiddleware(
    {
      key: params.key,
      throws: params.throws ?? false,
      options: {
        parseToJson: params.options?.parseToJson ?? false,
        parseBufferToString: params.options?.parseBufferToString ?? false
      }
    },
    getCacheValueStub,
    logger,
    errorHandler,
    extractValues
  );

  return {
    sut,
    logger,
    getCacheValueStub,
    errorHandler
  };
};

describe('GetCacheValueMiddleware', () => {
  const payload: any = {};
  const state: any = {};
  const setState = jest.fn();
  const next = jest.fn();

  it('should call GetCacheValue with key and false options', async () => {
    const { sut, getCacheValueStub } = makeSut({
      key: 'any_key',
      value: 'createEvent',
      subKey: 'id'
    });

    const getSpy = jest.spyOn(getCacheValueStub, 'get');

    await sut.handle(payload, [state, setState], next);

    const expected = {
      key: 'any_key.dW5kZWZpbmVk',
      options: {
        parseBufferToString: false,
        parseToJson: false
      },
      throws: false
    };

    expect(getSpy).toHaveBeenCalledTimes(1);
    expect(getSpy).toHaveBeenCalledWith(expected);
  });

  it('should call GetCacheValue with key and true options', async () => {
    const { sut, getCacheValueStub } = makeSut({
      key: 'any_key',
      throws: true,
      value: 'createEvent',
      subKey: 'id',
      options: { parseToJson: true, parseBufferToString: true }
    });

    const getSpy = jest.spyOn(getCacheValueStub, 'get');

    await sut.handle(payload, [state, setState], next);

    const expected = {
      key: 'any_key.dW5kZWZpbmVk',
      options: {
        parseBufferToString: true,
        parseToJson: true
      },
      throws: true
    };

    expect(getSpy).toHaveBeenCalledTimes(1);
    expect(getSpy).toHaveBeenCalledWith(expected);
  });

  it('should set state with cacheValues on success', async () => {
    const { sut } = makeSut({
      key: 'any_key',
      value: 'createEvent',
      subKey: 'id'
    });

    await sut.handle(payload, [state, setState], next);

    const expected = {
      cacheValues: {
        'any_key.dW5kZWZpbmVk': 'my cache value'
      }
    };

    expect(next).toHaveBeenCalledTimes(1);
    expect(setState).toHaveBeenCalledWith(expected);
  });

  it('should aggregate state when already exists cacheValues on state', async () => {
    const { sut } = makeSut({
      key: 'any_key',
      value: 'createEvent',
      subKey: 'id'
    });

    const stateWithCacheValues: any = {
      cacheValues: {
        getItem: 'cached item',
        getPayload: 'cached payload'
      }
    };

    await sut.handle(payload, [stateWithCacheValues, setState], next);

    const expected = {
      cacheValues: {
        'any_key.dW5kZWZpbmVk': 'my cache value',
        getItem: 'cached item',
        getPayload: 'cached payload'
      }
    };

    expect(next).toHaveBeenCalledTimes(1);
    expect(setState).toHaveBeenCalledWith(expected);
  });

  it('should call error handler and logger when GetCacheValue throws and throws is true', async () => {
    const { sut, getCacheValueStub, logger, errorHandler } = makeSut({
      key: 'any_key',
      throws: true,
      value: 'createEvent',
      subKey: 'id'
    });

    jest
      .spyOn(getCacheValueStub, 'get')
      .mockRejectedValueOnce(new Error('Cache Error'));

    const handlerSpy = jest.spyOn(errorHandler, 'handle');
    const logSpy = jest.spyOn(logger, 'log');

    await sut.handle(payload, [state, setState], next);

    const expected = {
      level: 'error',
      message: 'MISSING CACHE KEY: any_key',
      payload: {
        error: new Error('Cache Error')
      }
    };

    expect(handlerSpy).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledTimes(0);
    expect(logSpy).toHaveBeenCalledTimes(1);
    expect(logSpy).toHaveBeenCalledWith(expected);
  });

  it('should call error handler when GetCacheValue throws and call next when throws is false', async () => {
    const { sut, getCacheValueStub, errorHandler } = makeSut({
      key: 'any_key',
      throws: false,
      value: 'createEvent',
      subKey: 'id'
    });

    jest
      .spyOn(getCacheValueStub, 'get')
      .mockRejectedValueOnce(new Error('Cache Error'));

    const handlerSpy = jest.spyOn(errorHandler, 'handle');

    await sut.handle(payload, [state, setState], next);

    expect(handlerSpy).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledTimes(1);
  });
});
