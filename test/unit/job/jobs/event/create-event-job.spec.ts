import { Logger } from '@/data/protocols/util';
import { CreateEvent, ErrorHandler } from '@/domain/usecases';
import { CreateEventJob } from '@/job/jobs/event';
import { CreateEventStub } from '@/test/unit/domain/usecases';
import { ErrorHandlerStub, LoggerStub } from '@/test/util';
import { ELASTICSEARCH } from '@/util';

type SutTypes = {
  sut: CreateEventJob;
  createEventStub: CreateEvent;
  logger: Logger;
  errorHandler: ErrorHandler;
};

const makeSut = (): SutTypes => {
  const createEventStub = new CreateEventStub();
  const errorHandler = new ErrorHandlerStub();
  const logger = new LoggerStub();
  const sut = new CreateEventJob(createEventStub, logger, errorHandler);

  return {
    sut,
    logger,
    createEventStub,
    errorHandler
  };
};

describe('CreateEvent Job', () => {
  const payload: any = { body: { item: 'any_item' } };
  const state: any = {};
  const setState = jest.fn();
  const next = jest.fn();

  it('should call next when ELASTICSEARCH is not enabled', async () => {
    ELASTICSEARCH.ENABLED = false;

    const { sut, createEventStub } = makeSut();

    const createSpy = jest.spyOn(createEventStub, 'create');

    await sut.handle(payload, [state, setState], next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(createSpy).toHaveBeenCalledTimes(0);
  });

  it('should call CreateEvent with correct values', async () => {
    ELASTICSEARCH.ENABLED = true;

    const { sut, createEventStub } = makeSut();

    const createSpy = jest.spyOn(createEventStub, 'create');

    await sut.handle(payload, [state, setState], next);

    const expected = {
      event: '',
      mvno: '',
      payload: {
        item: 'any_item'
      },
      status: 'CREATED'
    };

    expect(createSpy).toHaveBeenCalledTimes(1);
    expect(createSpy).toHaveBeenCalledWith(expected);
  });

  it('should set state with createEven on success', async () => {
    const { sut } = makeSut();

    await sut.handle(payload, [state, setState], next);

    const expected = {
      createEven: {
        id: 'any_id'
      }
    };

    expect(next).toHaveBeenCalledTimes(1);
    expect(setState).toHaveBeenCalledWith(expected);
  });

  it('should call error handler when CreateEvent throws', async () => {
    const { sut, createEventStub, errorHandler } = makeSut();

    jest
      .spyOn(createEventStub, 'create')
      .mockRejectedValueOnce(new Error('Event Error'));

    const handlerSpy = jest.spyOn(errorHandler, 'handle');

    await sut.handle(payload, [state, setState], next);

    expect(handlerSpy).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledTimes(1);
  });
});
