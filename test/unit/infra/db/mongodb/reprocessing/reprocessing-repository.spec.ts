import { ReprocessingRepository } from '@/infra/db/mongodb/reprocessing/reprocessing-repository';
import { ReprocessingModel } from '@/infra/db/mongodb/reprocessing/reprocessing-model';

type SutTypes = { sut: ReprocessingRepository };
const makeSut = (): SutTypes => ({ sut: new ReprocessingRepository() });

const makeSaveParams = () => ({
  queue: 'my-queue',
  message: { reprocessing: { foo: 'bar' } },
  exchange: 'my-exchange',
  routingKey: 'my.routing.key'
});

describe('ReprocessingRepository', () => {
  describe('#save', () => {
    it('should call ReprocessingModel.create with snake_case params', async () => {
      const { sut } = makeSut();
      const createSpy = jest
        .spyOn(ReprocessingModel, 'create')
        .mockResolvedValueOnce({} as any);

      await sut.save(makeSaveParams());

      expect(createSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          queue: 'my-queue',
          exchange: 'my-exchange',
          routing_key: 'my.routing.key'
        })
      );
    });
  });

  describe('#getByIdentifier', () => {
    it('should call ReprocessingModel.find with $in query and return mapped records', async () => {
      const { sut } = makeSut();
      const mockRecords = [
        {
          reprocessing_id: 'id-1',
          message: { reprocessing: { a: 1 } },
          queue: 'q1',
          created_at: new Date('2024-01-01')
        }
      ];
      const execMock = jest.fn().mockResolvedValueOnce(mockRecords);
      jest
        .spyOn(ReprocessingModel, 'find')
        .mockReturnValueOnce({ exec: execMock } as any);

      const result = await sut.getByIdentifier({ reprocessingIds: ['id-1'] });

      expect(ReprocessingModel.find).toHaveBeenCalledWith({
        reprocessing_id: { $in: ['id-1'] }
      });
      expect(result).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ reprocessingId: 'id-1' })
        ])
      );
    });
  });

  describe('#delete', () => {
    it('should call ReprocessingModel.updateMany with deleted_at', async () => {
      const { sut } = makeSut();
      const execMock = jest.fn().mockResolvedValueOnce({});
      jest
        .spyOn(ReprocessingModel, 'updateMany')
        .mockReturnValueOnce({ exec: execMock } as any);

      await sut.delete({ reprocessingIds: ['id-1', 'id-2'] });

      expect(ReprocessingModel.updateMany).toHaveBeenCalledWith(
        { reprocessing_id: { $in: ['id-1', 'id-2'] } },
        expect.objectContaining({ deleted_at: expect.any(Date) })
      );
    });
  });

  describe('#get', () => {
    it('should query with $or conditions when queue is provided', async () => {
      const { sut } = makeSut();
      const execMock = jest.fn().mockResolvedValueOnce([]);
      jest
        .spyOn(ReprocessingModel, 'find')
        .mockReturnValueOnce({ exec: execMock } as any);

      await sut.get({ queue: 'test-queue' });

      expect(ReprocessingModel.find).toHaveBeenCalledWith(
        expect.objectContaining({
          $or: expect.arrayContaining([{ queue: 'test-queue' }])
        })
      );
    });

    it('should include date range filter when initialDateTime and finalDateTime are provided', async () => {
      const { sut } = makeSut();
      const execMock = jest.fn().mockResolvedValueOnce([]);
      jest
        .spyOn(ReprocessingModel, 'find')
        .mockReturnValueOnce({ exec: execMock } as any);

      const initialDateTime = new Date('2024-01-01');
      const finalDateTime = new Date('2024-01-31');

      await sut.get({ queue: 'q', initialDateTime, finalDateTime });

      expect(ReprocessingModel.find).toHaveBeenCalledWith(
        expect.objectContaining({
          created_at: { $gte: initialDateTime, $lt: finalDateTime }
        })
      );
    });

    it('should filter by deleted_at: null by default', async () => {
      const { sut } = makeSut();
      const execMock = jest.fn().mockResolvedValueOnce([]);
      jest
        .spyOn(ReprocessingModel, 'find')
        .mockReturnValueOnce({ exec: execMock } as any);

      await sut.get({});

      expect(ReprocessingModel.find).toHaveBeenCalledWith(
        expect.objectContaining({ deleted_at: null })
      );
    });
  });
});
