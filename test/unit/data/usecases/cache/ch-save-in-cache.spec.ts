import { SetCache } from '@/data/protocols/cache';
import { ChSaveInCache } from '@/data/usecases/cache';
import { SetCacheStub } from '@/test/unit/data/protocols';

type SutTypes = {
  sut: ChSaveInCache;
  setCacheStub: SetCache;
};

const makeSut = (): SutTypes => {
  const setCacheStub = new SetCacheStub();
  const sut = new ChSaveInCache(setCacheStub);
  return { setCacheStub, sut };
};

describe('ChSaveInCache UseCase', () => {
  it('should call SetCache with correct values', async () => {
    const { setCacheStub, sut } = makeSut();

    const setSpy = jest.spyOn(setCacheStub, 'set');

    const params = {
      key: 'any_key',
      subKey: 'any_sub_key',
      value: { any: 'value' },
      ttl: 100
    };

    await sut.save(params);

    const subKeyToBuffer = btoa('any_sub_key');
    const expected = {
      key: `any_key.${subKeyToBuffer}`,
      ttl: 100,
      value: { any: 'value' }
    };

    expect(setSpy).toHaveBeenCalledWith(expected);
  });

  it('should call SetCache with correct values when ttl is undefined', async () => {
    const { setCacheStub, sut } = makeSut();

    const setSpy = jest.spyOn(setCacheStub, 'set');

    const params = {
      key: 'any_key',
      subKey: 'any_sub_key',
      value: { any: 'value' },
      ttl: undefined
    };

    await sut.save(params);

    const subKeyToBuffer = btoa('any_sub_key');
    const expected = {
      key: `any_key.${subKeyToBuffer}`,
      ttl: undefined,
      value: { any: 'value' }
    };

    expect(setSpy).toHaveBeenCalledWith(expected);
  });

  it('should throw if SetCache throws', async () => {
    const { setCacheStub, sut } = makeSut();

    jest.spyOn(setCacheStub, 'set').mockRejectedValueOnce(new Error());

    const params = {
      key: 'any_key',
      subKey: 'any_sub_key',
      value: { any: 'value' },
      ttl: 100
    };

    const promise = sut.save(params);

    await expect(promise).rejects.toThrow();
  });

  it('should call SetCache with empty object value', async () => {
    const { setCacheStub, sut } = makeSut();

    const setSpy = jest.spyOn(setCacheStub, 'set');

    const params = {
      key: 'any_key',
      subKey: 'any_sub_key',
      value: {},
      ttl: 100
    };

    await sut.save(params);

    const subKeyToBuffer = btoa('any_sub_key');
    const expected = {
      key: `any_key.${subKeyToBuffer}`,
      ttl: 100,
      value: {}
    };

    expect(setSpy).toHaveBeenCalledWith(expected);
  });
});
