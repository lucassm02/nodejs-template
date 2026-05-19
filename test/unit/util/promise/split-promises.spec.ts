import { splitPromises } from '@/util/promise/split-promises';

describe('splitPromises', () => {
  it('should return empty array when callbacks is empty', async () => {
    const result = await splitPromises([], 3);
    expect(result).toEqual([]);
  });

  it('should resolve all promises and return results in order', async () => {
    const callbacks = [
      () => Promise.resolve(1),
      () => Promise.resolve(2),
      () => Promise.resolve(3)
    ];
    const result = await splitPromises(callbacks, 2);
    expect(result).toEqual([1, 2, 3]);
  });

  it('should run with maxRunning=1 (serial execution)', async () => {
    const order: number[] = [];
    const callbacks = [
      async () => {
        order.push(1);
        return 'a';
      },
      async () => {
        order.push(2);
        return 'b';
      },
      async () => {
        order.push(3);
        return 'c';
      }
    ];
    const result = await splitPromises(callbacks, 1);
    expect(result).toEqual(['a', 'b', 'c']);
    expect(order).toEqual([1, 2, 3]);
  });

  it('should capture errors without rejecting the whole batch', async () => {
    const error = new Error('fail');
    const callbacks = [
      () => Promise.resolve('ok'),
      () => Promise.reject(error),
      () => Promise.resolve('done')
    ];
    const result = (await splitPromises(callbacks, 3)) as any[];
    expect(result[0]).toBe('ok');
    expect(result[1]).toBe(error);
    expect(result[2]).toBe('done');
  });

  it('should handle single callback', async () => {
    const result = await splitPromises([() => Promise.resolve(42)], 1);
    expect(result).toEqual([42]);
  });

  it('should preserve order even when promises resolve out of order', async () => {
    const callbacks = [
      () =>
        new Promise<string>((resolve) => {
          setTimeout(() => resolve('slow'), 50);
        }),
      () => Promise.resolve('fast')
    ];
    const result = await splitPromises(callbacks, 2);
    expect(result).toEqual(['slow', 'fast']);
  });
});
