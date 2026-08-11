import { BulkInsertBuffer } from '@/infra/db/mongodb/util/bulk-insert-buffer';

type Document = { id: number };

const makeModel = () => ({
  insertMany: jest.fn().mockResolvedValue([]),
  docs: [] as Document[][]
});

describe('BulkInsertBuffer', () => {
  it('should flush once the queue reaches maxSize', async () => {
    const model = makeModel();
    const sut = new BulkInsertBuffer<Document>(model, {
      maxSize: 2,
      flushIntervalMs: 10_000
    });

    sut.enqueue({ id: 1 });

    expect(model.insertMany).not.toHaveBeenCalled();

    sut.enqueue({ id: 2 });
    await sut.flush();

    expect(model.insertMany).toHaveBeenCalledWith([{ id: 1 }, { id: 2 }], {
      ordered: false,
      writeConcern: { w: 0 }
    });
  });

  it('should drop the oldest documents when maxQueueSize is exceeded', async () => {
    const model = makeModel();
    const sut = new BulkInsertBuffer<Document>(model, {
      maxSize: 10_000,
      flushIntervalMs: 10_000,
      maxQueueSize: 3
    });

    for (let id = 1; id <= 5; id++) sut.enqueue({ id });

    expect(sut.getDroppedCount()).toBe(2);

    await sut.flush();

    expect(model.insertMany).toHaveBeenCalledWith(
      [{ id: 3 }, { id: 4 }, { id: 5 }],
      { ordered: false, writeConcern: { w: 0 } }
    );
  });

  it('should keep the queue bounded while the destination is slow', async () => {
    const model = makeModel();
    let releaseInsert!: () => void;

    model.insertMany.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          releaseInsert = () => resolve([]);
        })
    );

    const sut = new BulkInsertBuffer<Document>(model, {
      maxSize: 2,
      flushIntervalMs: 10_000,
      maxQueueSize: 4
    });

    sut.enqueue({ id: 1 });
    sut.enqueue({ id: 2 });

    for (let id = 3; id <= 20; id++) sut.enqueue({ id });

    releaseInsert();
    await sut.flush();

    expect(sut.getDroppedCount()).toBe(14);
  });

  it('should report insert failures through onError without throwing', async () => {
    const model = makeModel();
    const onError = jest.fn();
    const error = new Error('insert failed');

    model.insertMany.mockRejectedValueOnce(error);

    const sut = new BulkInsertBuffer<Document>(model, {
      maxSize: 1,
      flushIntervalMs: 10_000,
      onError
    });

    sut.enqueue({ id: 1 });
    await sut.flush();

    expect(onError).toHaveBeenCalledWith(error);
  });
});
