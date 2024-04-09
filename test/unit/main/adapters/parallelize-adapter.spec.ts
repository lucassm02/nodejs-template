import { parallelize, ParallelizeExceptions } from '@/main/adapters';

describe('parallelize adapter suite test', () => {
  it('should call all the handlers provided', async () => {
    const handlerMock = jest
      .fn()
      .mockResolvedValue(Promise.resolve(() => 'hi'));

    await parallelize(
      handlerMock,
      handlerMock,
      handlerMock,
      handlerMock,
      handlerMock
    )({}, {}, jest.fn());

    expect(handlerMock).toHaveBeenCalledTimes(5);
    expect(handlerMock).toHaveBeenCalledWith({}, {}, expect.any(Function));
  });
  it('should not throws if any handler provided rejects', async () => {
    const handlerMock = jest
      .fn()
      .mockResolvedValue(Promise.resolve(() => 'hi'));

    expect(
      parallelize(
        jest.fn().mockResolvedValue(Promise.reject(new Error('Im a error'))),
        handlerMock,
        handlerMock,
        handlerMock,
        handlerMock
      )({}, {}, jest.fn())
    ).resolves.not.toThrow();
  });
  it('should throw a error if the args provided not cotains a next function', () => {
    const handlerMock = jest
      .fn()
      .mockResolvedValue(Promise.resolve(() => 'hi'));

    expect(
      parallelize(
        handlerMock,
        handlerMock,
        handlerMock,
        handlerMock,
        handlerMock
      )({}, {})
    ).rejects.toThrow(ParallelizeExceptions.NOT_FOUND_NEXT);
  });
});
