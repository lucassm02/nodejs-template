import { ErrorHandler } from '@/domain/usecases';
import { PublishDataToReprocessingMiddleware } from '@/presentation/middlewares';
import { mockReprocessingModel } from '@/test/unit/domain/models';
import { PublishDataToReprocessingStub } from '@/test/unit/domain/usecases';
import { makeErrorHandlerStub, makeServerErrorMock } from '@/test/util';

type SutTypes = {
  sut: PublishDataToReprocessingMiddleware;
  publishDataToReprocessingStub: PublishDataToReprocessingStub;
  errorHandler: ErrorHandler;
};

const makeSut = (): SutTypes => {
  const publishDataToReprocessingStub = new PublishDataToReprocessingStub();
  const errorHandler = makeErrorHandlerStub();
  const sut = new PublishDataToReprocessingMiddleware(
    publishDataToReprocessingStub,
    errorHandler
  );

  return {
    sut,
    publishDataToReprocessingStub,
    errorHandler
  };
};

describe('PublishDataToReprocessingMiddleware', () => {
  const request: any = {};
  const state: any = {
    getReprocessingDataByIdentifier: [mockReprocessingModel]
  };
  const setState = jest.fn();
  const next = jest.fn();

  it('Should call publishDataToReprocessing witch correct values', async () => {
    const { sut, publishDataToReprocessingStub } = makeSut();

    const publishSpy = jest.spyOn(publishDataToReprocessingStub, 'publish');

    await sut.handle(request, [state, setState], next);

    const expected = [mockReprocessingModel];

    expect(publishSpy).toHaveBeenCalledTimes(1);
    expect(publishSpy).toHaveBeenCalledWith(expected);
  });

  it('Should return 500 if a unknown error throws', async () => {
    const { sut, publishDataToReprocessingStub, errorHandler } = makeSut();

    jest
      .spyOn(publishDataToReprocessingStub, 'publish')
      .mockRejectedValueOnce(new Error('Unknown Error.'));

    const errorHandlerSpy = jest.spyOn(errorHandler, 'handle');
    const result = await sut.handle(request, [state, setState], next);

    const expected = makeServerErrorMock();
    expect(result).toStrictEqual(expected);
    expect(errorHandlerSpy).toHaveBeenCalledTimes(1);
  });
});
