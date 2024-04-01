import { Logger } from '@/data/protocols/utils';
import { ErrorHandler, GetCacheValue } from '@/domain/usecases';
import { GetCacheValueJob } from '@/job';
import { GetCacheValueStub } from '@/test/unit/domain/usecases';
import { ErrorHandlerStub, LoggerStub } from '@/test/util';

type SutTypes = {
  sut: GetCacheValueJob;
  getCacheValueStub: GetCacheValue;
  logger: Logger;
  errorHandler: ErrorHandler;
};

type ArgsType = {
  key: string;
  throws?: boolean;
  options?: { parseToJson: boolean; parseBufferToString?: boolean };
};

const makeSut = (args: ArgsType): SutTypes => {
  const getCacheValueStub = new GetCacheValueStub();
  const errorHandler = new ErrorHandlerStub();
  const logger = new LoggerStub();
  const sut = new GetCacheValueJob(
    args,
    getCacheValueStub,
    logger,
    errorHandler
  );

  return {
    sut,
    logger,
    getCacheValueStub,
    errorHandler
  };
};

describe('GetCacheValue Job', () => {
  const payload: any = {};
  const state: any = {};
  const setState = jest.fn();
  const next = jest.fn();

  it('should call GetCacheValue with key and false options', async () => {
    const { sut, getCacheValueStub } = makeSut({ key: 'any_key' });

    const getSpy = jest.spyOn(getCacheValueStub, 'get');

    await sut.handle(payload, [state, setState], next);

    const expected = {
      key: 'any_key',
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
      options: { parseToJson: true, parseBufferToString: true }
    });

    const getSpy = jest.spyOn(getCacheValueStub, 'get');

    await sut.handle(payload, [state, setState], next);

    const expected = {
      key: 'any_key',
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
    const { sut } = makeSut({ key: 'any_key' });

    await sut.handle(payload, [state, setState], next);

    const expected = {
      cacheValues: {
        any_key: 'my cache value'
      }
    };

    expect(next).toHaveBeenCalledTimes(1);
    expect(setState).toHaveBeenCalledWith(expected);
  });

  it('should aggregate state when already exists cacheValues on state', async () => {
    const { sut } = makeSut({ key: 'any_key' });

    const stateWithCacheValues: any = {
      cacheValues: {
        getItem: 'cached item',
        getPayload: 'cached payload'
      }
    };

    await sut.handle(payload, [stateWithCacheValues, setState], next);

    const expected = {
      cacheValues: {
        any_key: 'my cache value',
        getItem: 'cached item',
        getPayload: 'cached payload'
      }
    };

    expect(next).toHaveBeenCalledTimes(1);
    expect(setState).toHaveBeenCalledWith(expected);
  });

  it('should call error handler and logger when GetCacheValue and throws is true', async () => {
    const { sut, getCacheValueStub, logger, errorHandler } = makeSut({
      key: 'any_key',
      throws: true
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
      throws: false
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
