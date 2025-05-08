import { Logger } from '@/data/protocols/util';
import { ErrorHandler, UpdateEvent } from '@/domain/usecases';
import { UpdateEventJob } from '@/job/jobs/event';
import { UpdateEventStub } from '@/test/unit/domain/usecases';
import { ErrorHandlerStub, LoggerStub } from '@/test/util';
import { ELASTICSEARCH } from '@/util';

type SutTypes = {
  sut: UpdateEventJob;
  updateEventStub: UpdateEvent;
  logger: Logger;
  errorHandler: ErrorHandler;
};

const makeSut = (): SutTypes => {
  const updateEventStub = new UpdateEventStub();
  const errorHandler = new ErrorHandlerStub();
  const logger = new LoggerStub();
  const sut = new UpdateEventJob(updateEventStub, logger, errorHandler);

  return {
    sut,
    logger,
    updateEventStub,
    errorHandler
  };
};

describe('UpdateEvent Job', () => {
  const payload: any = { body: { item: 'any_item' } };
  const state: any = {};
  const setState = jest.fn();
  const next = jest.fn();

  it('should call next when ELASTICSEARCH is not enabled', async () => {
    ELASTICSEARCH.ENABLED = false;

    const { sut, updateEventStub } = makeSut();

    const updateSpy = jest.spyOn(updateEventStub, 'update');

    await sut.handle(payload, [state, setState], next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(updateSpy).toHaveBeenCalledTimes(0);
  });

  it('should call UpdateEvent with correct values', async () => {
    ELASTICSEARCH.ENABLED = true;

    const { sut, updateEventStub } = makeSut();

    const updateSpy = jest.spyOn(updateEventStub, 'update');

    await sut.handle(payload, [state, setState], next);

    const expected = {
      status: 'SUCCESS'
    };

    expect(updateSpy).toHaveBeenCalledTimes(1);
    expect(updateSpy).toHaveBeenCalledWith(expected);
  });

  it('should call error handler when CreateEvent throws', async () => {
    const { sut, updateEventStub, errorHandler } = makeSut();

    jest
      .spyOn(updateEventStub, 'update')
      .mockRejectedValueOnce(new Error('Event Error'));

    const handlerSpy = jest.spyOn(errorHandler, 'handle');

    await sut.handle(payload, [state, setState], next);

    expect(handlerSpy).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledTimes(1);
  });
});
