import { ErrorHandler } from '@/domain/usecases';
import { DeleteReprocessingByIdentifierMiddleware } from '@/presentation/middlewares';
import { makeErrorHandlerStub, makeServerErrorMock } from '@/test/util';
import { DeleteReprocessingByIdentifierStub } from '@/test/unit/domain/usecases';
import { mockReprocessingModel } from '@/test/unit/domain/models';

type SutTypes = {
  sut: DeleteReprocessingByIdentifierMiddleware;
  deleteReprocessingByIdentifierStub: DeleteReprocessingByIdentifierStub;
  errorHandler: ErrorHandler;
};

const makeSut = (): SutTypes => {
  const deleteReprocessingByIdentifierStub =
    new DeleteReprocessingByIdentifierStub();
  const errorHandler = makeErrorHandlerStub();
  const sut = new DeleteReprocessingByIdentifierMiddleware(
    deleteReprocessingByIdentifierStub,
    errorHandler
  );

  return {
    sut,
    deleteReprocessingByIdentifierStub,
    errorHandler
  };
};

describe('DeleteReprocessingByIdentifierMiddleware', () => {
  const request: any = {};
  const state: any = {
    getReprocessingDataByIdentifier: [mockReprocessingModel]
  };
  const setState = jest.fn();
  const next = jest.fn();

  it('Should call deleteReprocessingByIdentifier witch correct values', async () => {
    const { sut, deleteReprocessingByIdentifierStub } = makeSut();

    const deleteSpy = jest.spyOn(deleteReprocessingByIdentifierStub, 'delete');

    await sut.handle(request, [state, setState], next);

    const expected = state.getReprocessingDataByIdentifier;

    expect(deleteSpy).toHaveBeenCalledTimes(1);
    expect(deleteSpy).toHaveBeenCalledWith(expected);
  });

  it('Should return 500 if a unknown error throws', async () => {
    const { sut, deleteReprocessingByIdentifierStub, errorHandler } = makeSut();

    jest
      .spyOn(deleteReprocessingByIdentifierStub, 'delete')
      .mockRejectedValueOnce(new Error('Unknown Error.'));

    const errorHandlerSpy = jest.spyOn(errorHandler, 'handle');
    const result = await sut.handle(request, [state, setState], next);

    const expected = makeServerErrorMock();
    expect(result).toStrictEqual(expected);
    expect(errorHandlerSpy).toHaveBeenCalledTimes(1);
  });
});
