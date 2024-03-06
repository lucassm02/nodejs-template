import { ErrorHandler } from '@/domain/usecases';
import { GetReprocessingDataByIdentifierMiddleware } from '@/presentation/middlewares';
import {
  GetReprocessingDataByIdentifierStub,
  mockReprocessingModel
} from '@/test/unit/domain';
import {
  makeErrorHandlerStub,
  makeNotFoundMock,
  makeServerErrorMock
} from '@/test/util';

type SutTypes = {
  sut: GetReprocessingDataByIdentifierMiddleware;
  getReprocessingDataByIdentifierStub: GetReprocessingDataByIdentifierStub;
  errorHandler: ErrorHandler;
};

const makeSut = (): SutTypes => {
  const getReprocessingDataByIdentifierStub =
    new GetReprocessingDataByIdentifierStub();
  const errorHandler = makeErrorHandlerStub();
  const sut = new GetReprocessingDataByIdentifierMiddleware(
    getReprocessingDataByIdentifierStub,
    errorHandler
  );

  return {
    sut,
    getReprocessingDataByIdentifierStub,
    errorHandler
  };
};

describe('GetReprocessingDataByIdentifierMiddleware', () => {
  const request: any = { body: { reprocessingIds: ['any_reprocessing_id'] } };
  const state: any = {};
  const setState = jest.fn();
  const next = jest.fn();

  it('Should call getReprocessingDataByIdentifier witch correct values', async () => {
    const { sut, getReprocessingDataByIdentifierStub } = makeSut();

    const getSpy = jest.spyOn(getReprocessingDataByIdentifierStub, 'get');

    await sut.handle(request, [state, setState], next);

    const expected = {
      reprocessingIds: request.body.reprocessingIds
    };

    expect(getSpy).toHaveBeenCalledTimes(1);
    expect(getSpy).toHaveBeenCalledWith(expected);
  });

  it('Should call the next function if reprocessingIds is an empty array', () => {
    const { sut } = makeSut();

    const reprocessingIdsEmpty: any = { body: { reprocessingIds: [] } };

    sut.handle(reprocessingIdsEmpty, [state, setState], next);

    expect(next).toHaveBeenCalledTimes(1);
  });

  it('Should call setState with getReprocessingDataByIdentifier result', async () => {
    const { sut } = makeSut();

    await sut.handle(request, [state, setState], next);

    const expected = {
      getReprocessingDataByIdentifier: [mockReprocessingModel]
    };

    expect(setState).toHaveBeenCalledTimes(1);
    expect(setState).toHaveBeenCalledWith(expected);
  });

  it('Should return 404 if getReprocessingDataByIdentifier not find data to reprocessing', async () => {
    const { sut, getReprocessingDataByIdentifierStub, errorHandler } =
      makeSut();

    jest
      .spyOn(getReprocessingDataByIdentifierStub, 'get')
      .mockRejectedValueOnce(new Error('Reprocessing data not found.'));

    const errorHandlerSpy = jest.spyOn(errorHandler, 'handle');

    const result = await sut.handle(request, [state, setState], next);

    const expected = makeNotFoundMock(
      'Não foi encontrado nenhum dado para reprocessamento.'
    );

    expect(result).toStrictEqual(expected);
    expect(errorHandlerSpy).toHaveBeenCalledTimes(1);
  });

  it('Should return 500 if a unknown error throws', async () => {
    const { sut, getReprocessingDataByIdentifierStub, errorHandler } =
      makeSut();

    jest
      .spyOn(getReprocessingDataByIdentifierStub, 'get')
      .mockRejectedValueOnce(new Error('Unknown Error.'));

    const errorHandlerSpy = jest.spyOn(errorHandler, 'handle');
    const result = await sut.handle(request, [state, setState], next);

    const expected = makeServerErrorMock();
    expect(result).toStrictEqual(expected);
    expect(errorHandlerSpy).toHaveBeenCalledTimes(1);
  });
});
