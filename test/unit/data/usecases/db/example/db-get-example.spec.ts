import { GetExampleRepository } from '@/data/protocols/db';
import { DbGetExample } from '@/data/usecases/db';

import { GetExampleRepositoryStub } from '../../../protocols';

type SutTypes = {
  sut: DbGetExample;
  getExampleRepositoryStub: GetExampleRepository;
};

const makeSut = (): SutTypes => {
  const getExampleRepositoryStub = new GetExampleRepositoryStub();
  const sut = new DbGetExample(getExampleRepositoryStub);

  return {
    sut,
    getExampleRepositoryStub
  };
};

describe('DbDeleteReprocessingByIdentifier UseCase', () => {
  it('Should call GetExampleRepository', async () => {
    const { sut, getExampleRepositoryStub } = makeSut();

    const getSpy = jest.spyOn(getExampleRepositoryStub, 'get');

    await sut.get();

    expect(getSpy).toHaveBeenCalledTimes(1);
  });
});
