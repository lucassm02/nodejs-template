import { GenericTransport } from '@/util/observability/loggers/default/transports/generic-transport';

const LEVEL = Symbol.for('level');
const MESSAGE = Symbol.for('message');

const makeLogParams = (
  level: string,
  message: string
): Record<symbol, string> => ({ [LEVEL]: level, [MESSAGE]: message }) as any;

type SutTypes = { sut: GenericTransport; receiver: jest.Mock };

const makeSut = (level = 'info'): SutTypes => {
  const receiver = jest.fn();
  const sut = new GenericTransport({ level, receiver });
  return { sut, receiver };
};

describe('GenericTransport', () => {
  it('should call receiver when log level matches transport level', () => {
    const { sut, receiver } = makeSut('info');
    const params = makeLogParams('info', JSON.stringify({ message: 'hello' }));
    sut.log(params, jest.fn());
    expect(receiver).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'hello', level: 'info' })
    );
  });

  it('should call receiver for a more verbose level than transport level', () => {
    const { sut, receiver } = makeSut('debug');
    const params = makeLogParams('info', JSON.stringify({ message: 'msg' }));
    sut.log(params, jest.fn());
    expect(receiver).toHaveBeenCalled();
  });

  it('should NOT call receiver when log level is more verbose than transport level', () => {
    const { sut, receiver } = makeSut('error');
    const params = makeLogParams(
      'debug',
      JSON.stringify({ message: 'verbose' })
    );
    sut.log(params, jest.fn());
    expect(receiver).not.toHaveBeenCalled();
  });

  it('should wrap non-JSON message in object', () => {
    const { sut, receiver } = makeSut('info');
    const params = makeLogParams('info', 'plain text');
    sut.log(params, jest.fn());
    expect(receiver).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'plain text' })
    );
  });

  it('should always call callback', () => {
    const { sut } = makeSut('error');
    const callback = jest.fn();
    const params = makeLogParams('debug', 'msg');
    sut.log(params, callback);
    expect(callback).toHaveBeenCalledTimes(1);
  });
});
