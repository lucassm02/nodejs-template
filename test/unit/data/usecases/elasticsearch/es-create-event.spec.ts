import { GetAPMTransactionIds } from '@/data/protocols/apm';
import { EsCreateEvent } from '@/data/usecases/elasticsearch';
import { CreateDocumentServiceStub } from '@/test/unit/data/protocols';
import { getApmTransactionIdsStub } from '@/test/utils';
import { formatDate } from '@/util';

type SutTypes = {
  sut: EsCreateEvent;
  createDocumentServiceStub: CreateDocumentServiceStub;
  getApmTransactionIdsStub: GetAPMTransactionIds;
};

const makeSut = (): SutTypes => {
  const createDocumentServiceStub = new CreateDocumentServiceStub();

  const sut = new EsCreateEvent(
    createDocumentServiceStub,
    getApmTransactionIdsStub,
    formatDate
  );

  return {
    sut,
    getApmTransactionIdsStub,
    createDocumentServiceStub
  };
};

describe('EsCreateEvent UseCase', () => {
  it('Should call createDocumentService witch correct values', async () => {
    const { sut, createDocumentServiceStub } = makeSut();

    const create = jest.spyOn(createDocumentServiceStub, 'create');

    const params = {
      event: 'any_event',
      mvno: 'any_mvno',
      status: 'CREATED',
      payload: {}
    };

    await sut.create(params);

    const now = new Date();
    const nowToString = formatDate(now, 'yyyy-MM-dd HH:mm:ss');

    expect(create).toHaveBeenCalledWith({
      id: 'any_transaction_id',
      index: 'datora-event',
      data: { ...params, createdAt: nowToString, updatedAt: nowToString }
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

    const result = await sut.create(params);

    expect(result).toBeUndefined();
  });
});
