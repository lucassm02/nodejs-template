import { GetCache } from '@/data/protocols/cache';
import { ChGetCacheValue } from '@/data/usecases/cache';

import { GetCacheStub } from '../../protocols/cache';

type SutTypes = {
  sut: ChGetCacheValue;
  getCacheStub: GetCache;
};

const makeSut = (): SutTypes => {
  const getCacheStub = new GetCacheStub();
  const sut = new ChGetCacheValue(getCacheStub);

  return { getCacheStub, sut };
};

describe('ChGetCacheValue UseCase', () => {
  it('should call GetCache with correct values', async () => {
    const { getCacheStub, sut } = makeSut();

    const getSpy = jest.spyOn(getCacheStub, 'get');

    await sut.get({
      key: 'any_key',
      options: { parseBufferToString: true, parseToJson: true }
    });

    const expected = [
      'any_key',
      { parseBufferToString: true, parseToJson: true }
    ];
    expect(getSpy).toHaveBeenCalledWith(...expected);
  });

  it('should trow error when GetCache return undefined and params throws is true', async () => {
    const { getCacheStub, sut } = makeSut();

    jest.spyOn(getCacheStub, 'get').mockResolvedValueOnce(undefined);

    try {
      await sut.get({
        key: 'any_key',
        throws: true,
        options: { parseBufferToString: true, parseToJson: true }
      });
    } catch (error) {
      const expected = 'ERROR_ON_GET_CACHE_VALUE';
      expect(error.message).toStrictEqual(expected);
    }
  });

  it('should return null when GetCache return undefined and params throws is false', async () => {
    const { getCacheStub, sut } = makeSut();

    jest.spyOn(getCacheStub, 'get').mockResolvedValueOnce(undefined);

    const result = await sut.get({
      key: 'any_key',
      throws: false,
      options: { parseBufferToString: true, parseToJson: true }
    });

    const expected = null;
    expect(result).toStrictEqual(expected);
  });

  it('should return a Buffer when parse to string is false', async () => {
    const { sut } = makeSut();

    const result = await sut.get({
      key: 'any_key',
      throws: false,
      options: { parseBufferToString: false, parseToJson: true }
    });

    const expected = Buffer.from('any_buffer');
    expect(result).toStrictEqual(expected);
  });

  it('should return a string when parse to string is true', async () => {
    const { sut } = makeSut();

    const result = await sut.get({
      key: 'any_key',
      throws: false,
      options: { parseBufferToString: true, parseToJson: true }
    });

    const expected = 'any_buffer';
    expect(result).toStrictEqual(expected);
  });
});
