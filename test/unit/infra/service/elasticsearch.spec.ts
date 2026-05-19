import { Client } from '@elastic/elasticsearch';
import { Elasticsearch } from '@/infra/service/elasticsearch';

jest.mock('@elastic/elasticsearch');

const makeClientMock = () => ({
  index: jest.fn().mockResolvedValue({ _id: 'doc-id-1' }),
  update: jest.fn().mockResolvedValue({ _id: 'doc-id-2' }),
  get: jest
    .fn()
    .mockResolvedValue({ _source: { document_name: 'test', status: 'active' } })
});

let clientMock: ReturnType<typeof makeClientMock>;

beforeEach(() => {
  clientMock = makeClientMock();
  (Client as jest.Mock).mockImplementation(() => clientMock);
});

type SutTypes = { sut: Elasticsearch };
const makeSut = (): SutTypes => ({ sut: new Elasticsearch() });

describe('Elasticsearch', () => {
  describe('#create', () => {
    it('should call client.index with correct params and return id', async () => {
      const { sut } = makeSut();

      const result = await sut.create({
        index: 'my-index',
        id: 'id-1',
        data: { name: 'test' }
      });

      expect(clientMock.index).toHaveBeenCalledWith(
        expect.objectContaining({ index: 'my-index', id: 'id-1' })
      );
      expect(result).toEqual({ id: 'doc-id-1' });
    });

    it('should convert camelCase data keys to snake_case', async () => {
      const { sut } = makeSut();

      await sut.create({
        index: 'idx',
        id: '1',
        data: { documentName: 'hello' }
      });

      expect(clientMock.index).toHaveBeenCalledWith(
        expect.objectContaining({
          document: expect.objectContaining({ document_name: 'hello' })
        })
      );
    });
  });

  describe('#update', () => {
    it('should call client.update with correct params and return id', async () => {
      const { sut } = makeSut();

      const result = await sut.update({
        index: 'my-index',
        id: 'id-2',
        data: { status: 'done' }
      });

      expect(clientMock.update).toHaveBeenCalledWith(
        expect.objectContaining({ index: 'my-index', id: 'id-2' })
      );
      expect(result).toEqual({ id: 'doc-id-2' });
    });
  });

  describe('#getById', () => {
    it('should call client.get and return converted source', async () => {
      const { sut } = makeSut();

      const result = await sut.getById({ index: 'my-index', id: 'id-3' });

      expect(clientMock.get).toHaveBeenCalledWith({
        index: 'my-index',
        id: 'id-3'
      });
      expect(result).toMatchObject({ documentName: 'test', status: 'active' });
    });

    it('should return undefined when client.get throws', async () => {
      const { sut } = makeSut();
      clientMock.get.mockRejectedValueOnce(new Error('Not found'));

      const result = await sut.getById({ index: 'my-index', id: 'missing' });

      expect(result).toBeUndefined();
    });
  });
});
