import { CreateExampleRepository } from '@/data/protocols/db';
import { DbCreateExample } from '@/data/usecases/db';

import { CreateExampleRepositoryStub } from '../../../protocols';

type SutTypes = {
  sut: DbCreateExample;
  createExampleRepositoryStub: CreateExampleRepository;
};

const makeSut = (): SutTypes => {
  const createExampleRepositoryStub = new CreateExampleRepositoryStub();
  const sut = new DbCreateExample(createExampleRepositoryStub);

  return {
    sut,
    createExampleRepositoryStub
  };
};

describe('DbDeleteReprocessingByIdentifier UseCase', () => {
  it('Should call CreateExampleRepository witch correct values', async () => {
    const { sut, createExampleRepositoryStub } = makeSut();

    const createSpy = jest.spyOn(createExampleRepositoryStub, 'create');

    await sut.create({ description: 'any_description', value: 'any_value' });

    const expected = {
      description: 'any_description',
      value: 'any_value'
    };
    expect(createSpy).toHaveBeenCalledWith(expected);
  });
});
