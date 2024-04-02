import { ErrorHandlerProtocol } from '@/data/protocols/exception';
import { ExErrorHandler } from '@/data/usecases/exception';

type SutTypes = {
  sut: ExErrorHandler;
  handlers: ErrorHandlerProtocol[];
};

const makeSut = (): SutTypes => {
  const handlers = [jest.fn(), jest.fn()];
  const sut = new ExErrorHandler(handlers);

  return {
    sut,
    handlers
  };
};

describe('ExErrorHandler UseCase', () => {
  it('should call Handlers without transaction', async () => {
    const { handlers, sut } = makeSut();

    const error = new Error('My Error');
    await sut.handle(error);

    const expected1 = [error, undefined];
    const expected2 = [error, undefined];

    expect(handlers[0]).toHaveBeenCalledTimes(1);
    expect(handlers[0]).toHaveBeenCalledWith(...expected1);
    expect(handlers[1]).toHaveBeenCalledTimes(1);
    expect(handlers[1]).toHaveBeenCalledWith(...expected2);
  });

  it('should call Handlers with transaction', async () => {
    const { handlers, sut } = makeSut();

    const error = new Error('My Error');
    const transaction = { rollback: jest.fn(), commit: jest.fn() };
    await sut.handle(error, [transaction]);

    const expected1 = [error, [transaction]];
    const expected2 = [error, [transaction]];

    expect(handlers[0]).toHaveBeenCalledTimes(1);
    expect(handlers[0]).toHaveBeenCalledWith(...expected1);
    expect(handlers[1]).toHaveBeenCalledTimes(1);
    expect(handlers[1]).toHaveBeenCalledWith(...expected2);
  });
});
