import { ErrorHandler, SaveInCache } from '@/domain/usecases';
import { SaveInCacheJob } from '@/job';
import { SaveInCacheStub } from '@/test/unit/domain/usecases';
import { ErrorHandlerStub } from '@/test/util';

type SutTypes = {
  sut: SaveInCacheJob;
  saveInCacheStub: SaveInCache;
  errorHandler: ErrorHandler;
};

type ArgsType = {
  key: string;
  throws?: boolean;
  ttl?: number;
};

const makeSut = (
  args: ArgsType,
  valuesToExtract: (string | Record<string, string>)[]
): SutTypes => {
  const saveInCacheStub = new SaveInCacheStub();
  const errorHandler = new ErrorHandlerStub();
  const sut = new SaveInCacheJob(
    args,
    errorHandler,
    saveInCacheStub,
    valuesToExtract
  );

  return {
    sut,
    saveInCacheStub,
    errorHandler
  };
};

describe('GetCacheValue Job', () => {
  const payload: any = {};
  const state: any = { body: { item: 'any_item' } };
  const setState = jest.fn();
  const next = jest.fn();

  it('should call SaveInCache with key and value', async () => {
    const { sut, saveInCacheStub } = makeSut({ key: 'any_key' }, [
      'state.body.item'
    ]);

    const saveSpy = jest.spyOn(saveInCacheStub, 'save');

    await sut.handle(payload, [state, setState], next);

    const expected = {
      key: 'any_key',
      value: {
        item: 'any_item'
      }
    };

    expect(saveSpy).toHaveBeenCalledTimes(1);
    expect(saveSpy).toHaveBeenCalledWith(expected);
  });

  it('should call SaveInCache with key, value and ttl', async () => {
    const { sut, saveInCacheStub } = makeSut({ key: 'any_key', ttl: 100 }, [
      'state.body.item'
    ]);

    const saveSpy = jest.spyOn(saveInCacheStub, 'save');

    await sut.handle(payload, [state, setState], next);

    const expected = {
      key: 'any_key',
      ttl: 100,
      value: {
        item: 'any_item'
      }
    };

    expect(saveSpy).toHaveBeenCalledTimes(1);
    expect(saveSpy).toHaveBeenCalledWith(expected);
  });

  it('should call error handler when SaveInCache throw and not call next when throws is true', async () => {
    const { sut, saveInCacheStub, errorHandler } = makeSut(
      {
        key: 'any_key',
        throws: true
      },
      ['']
    );

    jest
      .spyOn(saveInCacheStub, 'save')
      .mockRejectedValueOnce(new Error('Save Error'));

    const handlerSpy = jest.spyOn(errorHandler, 'handle');

    await sut.handle(payload, [state, setState], next);

    expect(handlerSpy).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledTimes(0);
  });

  it('should call error handler when SaveInCache throw and call next when throws is false', async () => {
    const { sut, saveInCacheStub, errorHandler } = makeSut(
      {
        key: 'any_key',
        throws: false
      },
      ['']
    );

    jest
      .spyOn(saveInCacheStub, 'save')
      .mockRejectedValueOnce(new Error('Save Error'));

    const handlerSpy = jest.spyOn(errorHandler, 'handle');

    await sut.handle(payload, [state, setState], next);

    expect(handlerSpy).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('should call error handler when SaveInCache throw and call next when throws is not fined', async () => {
    const { sut, saveInCacheStub, errorHandler } = makeSut(
      {
        key: 'any_key'
      },
      ['']
    );

    jest
      .spyOn(saveInCacheStub, 'save')
      .mockRejectedValueOnce(new Error('Save Error'));

    const handlerSpy = jest.spyOn(errorHandler, 'handle');

    await sut.handle(payload, [state, setState], next);

    expect(handlerSpy).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledTimes(1);
  });
});
