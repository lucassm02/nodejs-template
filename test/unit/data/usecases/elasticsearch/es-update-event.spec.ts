import { GetAPMTransactionIds } from '@/data/protocols/apm';
import { EsUpdateEvent } from '@/data/usecases/elasticsearch';
import {
  GetDocumentByIdServiceStub,
  UpdateDocumentServiceStub
} from '@/test/unit/data/protocols';
import { getApmTransactionIdsStub } from '@/test/util';
import { formatDate, merge } from '@/util';

type SutTypes = {
  sut: EsUpdateEvent;
  updateDocumentServiceStub: UpdateDocumentServiceStub;
  getDocumentByIdServiceStub: GetDocumentByIdServiceStub;
  getApmTransactionIdsStub: GetAPMTransactionIds;
};

const makeSut = (): SutTypes => {
  const getDocumentByIdServiceStub = new GetDocumentByIdServiceStub();
  const updateDocumentServiceStub = new UpdateDocumentServiceStub();

  const sut = new EsUpdateEvent(
    updateDocumentServiceStub,
    getDocumentByIdServiceStub,
    getApmTransactionIdsStub,
    merge,
    formatDate
  );

  return {
    sut,
    updateDocumentServiceStub,
    getDocumentByIdServiceStub,
    getApmTransactionIdsStub
  };
};

describe('EsCreateEvent UseCase', () => {
  beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-02-06 12:31:48'));
  });

  afterAll(() => {
    jest.clearAllTimers();
  });

  it('Should call getDocumentByIdService witch correct values', async () => {
    const { sut, getDocumentByIdServiceStub } = makeSut();

    const getById = jest.spyOn(getDocumentByIdServiceStub, 'getById');

    const params = {
      event: 'any_event',
      mvno: 'any_mvno',
      status: 'CREATED',
      payload: {}
    };

    await sut.update(params);

    expect(getById).toHaveBeenCalledWith({
      index: 'datora-event',
      id: 'any_transaction_id'
    });
  });

  it('Should call updateDocumentServiceStub witch correct values', async () => {
    const { sut, updateDocumentServiceStub } = makeSut();

    const getById = jest.spyOn(updateDocumentServiceStub, 'update');

    const params = {
      event: 'any_event',
      mvno: 'any_mvno',
      status: 'CREATED',
      payload: {}
    };

    await sut.update(params);

    expect(getById).toHaveBeenCalledWith({
      id: 'any_transaction_id',
      index: 'datora-event',
      data: {
        event: 'any_event',
        id: 'any_id',
        mvno: 'any_mvno',
        payload: {},
        status: 'CREATED',
        updatedAt: '2024-02-06 12:31:48'
      }
    });
  });

  it('Should return undefined when getApmTransactionIds returns null', async () => {
    const { sut } = makeSut();

    const params = {
      event: 'any_event',
      mvno: 'any_mvno',
      status: 'CREATED',
      payload: {}
    };

    getApmTransactionIdsStub.mockReturnValue(null);

    const result = await sut.update(params);

    expect(result).toBeUndefined();
  });
});
