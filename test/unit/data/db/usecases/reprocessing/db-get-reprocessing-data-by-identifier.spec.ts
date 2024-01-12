import { DbGetReprocessingDataByIdentifier } from '@/data/usecases/db';
import { GetReprocessingDataByIdentifierRepositoryStub } from '@/test/unit/data/db/mocks';

type SutTypes = {
  sut: DbGetReprocessingDataByIdentifier;
  getReprocessingDataByIdentifierRepositoryStub: GetReprocessingDataByIdentifierRepositoryStub;
};

const makeSut = (): SutTypes => {
  const getReprocessingDataByIdentifierRepositoryStub =
    new GetReprocessingDataByIdentifierRepositoryStub();
  const sut = new DbGetReprocessingDataByIdentifier(
    getReprocessingDataByIdentifierRepositoryStub
  );

  return {
    sut,
    getReprocessingDataByIdentifierRepositoryStub
  };
};

describe('DbGetReprocessingDataByIdentifier UseCase', () => {
  it('Should call GetReprocessingDataByIdentifierRepository witch correct values', async () => {
    const { sut, getReprocessingDataByIdentifierRepositoryStub } = makeSut();

    const getByIdentifier = jest.spyOn(
      getReprocessingDataByIdentifierRepositoryStub,
      'getByIdentifier'
    );

    const params = { reprocessingIds: ['any_reprocessing_id'] };
    await sut.get(params);

    expect(getByIdentifier).toHaveBeenCalledWith(params);
  });

  it('Should throw if GetReprocessingDataByIdentifierRepository return array empty', async () => {
    const { sut, getReprocessingDataByIdentifierRepositoryStub } = makeSut();

    jest
      .spyOn(getReprocessingDataByIdentifierRepositoryStub, 'getByIdentifier')
      .mockResolvedValueOnce([]);

    const params = { reprocessingIds: ['any_reprocessing_id'] };

    const promise = sut.get(params);

    await expect(promise).rejects.toThrowError('Reprocessing data not found.');
  });
});
