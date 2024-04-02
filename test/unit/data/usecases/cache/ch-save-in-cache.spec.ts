import { SetCache } from '@/data/protocols/cache';
import { ChSaveInCache } from '@/data/usecases/cache';

import { SetCacheStub } from '../../protocols/cache';

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

    await sut.save({ key: 'any_key', value: 'any_value', ttl: 100 });

    const expected = { key: 'any_key', ttl: 100, value: 'any_value' };
    expect(setSpy).toHaveBeenCalledWith(expected);
  });
});
