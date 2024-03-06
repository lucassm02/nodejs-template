import { ErrorHandler } from '@/domain/usecases';
import { GetReprocessingDataMiddleware } from '@/presentation/middlewares';
import {
  GetReprocessingDataStub,
  mockReprocessingModel
} from '@/test/unit/domain';
import {
  makeErrorHandlerStub,
  makeNotFoundMock,
  makeServerErrorMock
} from '@/test/util';

type SutTypes = {
  sut: GetReprocessingDataMiddleware;
  getReprocessingDataStub: GetReprocessingDataStub;
  errorHandler: ErrorHandler;
};

const makeSut = (): SutTypes => {
  const getReprocessingDataStub = new GetReprocessingDataStub();
  const errorHandler = makeErrorHandlerStub();
  const sut = new GetReprocessingDataMiddleware(
    getReprocessingDataStub,
    errorHandler
  );

  return {
    sut,
    getReprocessingDataStub,
    errorHandler
  };
};

describe('GetReprocessingDataMiddleware', () => {
  const request: any = {
    query: {
      queue: 'any_queue',
      finalDate: '2024-01-13',
      exchange: 'any_exchange',
      initialDate: '2024-01-13',
      routingKey: 'any_routing_key'
    }
  };
  const state: any = {};
  const setState = jest.fn();
  const next = jest.fn();

  it('Should call getReprocessingData witch correct values', async () => {
    const { sut, getReprocessingDataStub } = makeSut();

    const getSpy = jest.spyOn(getReprocessingDataStub, 'get');

    await sut.handle(request, [state, setState], next);

    const expected = {
      queue: 'any_queue',
      finalDate: '2024-01-13',
      exchange: 'any_exchange',
      initialDate: '2024-01-13',
      routingKey: 'any_routing_key'
    };

    expect(getSpy).toHaveBeenCalledTimes(1);
    expect(getSpy).toHaveBeenCalledWith(expected);
  });

  it('Should call setState with getReprocessingData result', async () => {
    const { sut } = makeSut();

    await sut.handle(request, [state, setState], next);

    const expected = { getReprocessingData: [mockReprocessingModel] };

    expect(setState).toHaveBeenCalledTimes(1);
    expect(setState).toHaveBeenCalledWith(expected);
  });

  it('Should return 404 if getReprocessingData not find data to reprocessing', async () => {
    const { sut, getReprocessingDataStub, errorHandler } = makeSut();

    jest
      .spyOn(getReprocessingDataStub, 'get')
      .mockRejectedValueOnce(new Error('Reprocessing data not found.'));

    const errorHandlerSpy = jest.spyOn(errorHandler, 'handle');

    const result = await sut.handle(request, [state, setState], next);

    const expected = makeNotFoundMock(
      'Dados para reprocessamento não encontrado(a).',
      {}
    );

    expect(result).toStrictEqual(expected);
    expect(errorHandlerSpy).toHaveBeenCalledTimes(1);
  });

  it('Should return 500 if a unknown error throws', async () => {
    const { sut, getReprocessingDataStub, errorHandler } = makeSut();

    jest
      .spyOn(getReprocessingDataStub, 'get')
      .mockRejectedValueOnce(new Error('Unknown Error.'));

    const errorHandlerSpy = jest.spyOn(errorHandler, 'handle');
    const result = await sut.handle(request, [state, setState], next);

    const expected = makeServerErrorMock();
    expect(result).toStrictEqual(expected);
    expect(errorHandlerSpy).toHaveBeenCalledTimes(1);
  });
});
