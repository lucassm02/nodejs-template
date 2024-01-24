import { DbDeleteReprocessingByIdentifier } from '@/data/usecases/db';
import { DeleteReprocessingByIdentifierRepositoryStub } from '@/test/unit/data/db/mocks';

type SutTypes = {
  sut: DbDeleteReprocessingByIdentifier;
  deleteReprocessingByIdentifierRepositoryStub: DeleteReprocessingByIdentifierRepositoryStub;
};

const makeSut = (): SutTypes => {
  const deleteReprocessingByIdentifierRepositoryStub =
    new DeleteReprocessingByIdentifierRepositoryStub();
  const sut = new DbDeleteReprocessingByIdentifier(
    deleteReprocessingByIdentifierRepositoryStub
  );

  return {
    sut,
    deleteReprocessingByIdentifierRepositoryStub
  };
};

describe('DbDeleteReprocessingByIdentifier UseCase', () => {
  it('Should call deleteReprocessingByIdentifierRepository witch correct values', async () => {
    const { sut, deleteReprocessingByIdentifierRepositoryStub } = makeSut();

    const any = jest.spyOn(
      deleteReprocessingByIdentifierRepositoryStub,
      'delete'
    );

    const params = [
      {
        reprocessingId: 'any_reprocessing_id',
        reprocessing: {},
        queue: 'any_queue'
      }
    ];
    await sut.delete(params);

    const reprocessingIds = { reprocessingIds: ['any_reprocessing_id'] };
    expect(any).toHaveBeenCalledWith(reprocessingIds);
  });
});
