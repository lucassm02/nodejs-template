import { DbGetReprocessingData } from '@/data/usecases/db';
import { GetReprocessingDataRepositoryStub } from '@/test/unit/data/db/mocks';

type SutTypes = {
  sut: DbGetReprocessingData;
  getReprocessingDataRepositoryStub: GetReprocessingDataRepositoryStub;
};

const makeSut = (): SutTypes => {
  const getReprocessingDataRepositoryStub =
    new GetReprocessingDataRepositoryStub();
  const sut = new DbGetReprocessingData(getReprocessingDataRepositoryStub);

  return {
    sut,
    getReprocessingDataRepositoryStub
  };
};

describe('DbGetReprocessingData UseCase', () => {
  it('Should call getReprocessingDataRepository witch correct values', async () => {
    const { sut, getReprocessingDataRepositoryStub } = makeSut();

    const get = jest.spyOn(getReprocessingDataRepositoryStub, 'get');

    const params = {
      exchange: 'any_exchange',
      routingKey: 'any_routing_key',
      queue: 'any_queue',
      finalDate: '2024-01-12',
      initialDate: '2024-01-12'
    };
    await sut.get(params);

    expect(get).toHaveBeenCalledWith({
      exchange: 'any_exchange',
      routingKey: 'any_routing_key',
      queue: 'any_queue',
      finalDateTime: '2024-01-12 23:59:59',
      initialDateTime: '2024-01-12 00:00:00'
    });
  });

  it('Should throw if getReprocessingDataRepository return array empty', async () => {
    const { sut, getReprocessingDataRepositoryStub } = makeSut();

    jest
      .spyOn(getReprocessingDataRepositoryStub, 'get')
      .mockResolvedValueOnce([]);

    const params = {
      exchange: 'any_exchange',
      routingKey: 'any_routing_key',
      queue: 'any_queue',
      finalDate: '2024-01-12',
      initialDate: '2024-01-12'
    };
    const promise = sut.get(params);

    await expect(promise).rejects.toThrowError('Reprocessing data not found.');
  });
});
