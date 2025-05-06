import { Logger } from '@/data/protocols/util';
import { ErrorHandler } from '@/domain/usecases';
import { MqPublishInExchangeMiddleware } from '@/presentation/middlewares';
import { ModelMock } from '@/test/unit/domain/models';
import { PublishInExchangeStub } from '@/test/unit/domain/usecases';
import {
  LoggerStub,
  makeErrorHandlerStub,
  makeServerErrorMock
} from '@/test/util';
import { logger as StateLogger } from '@/util';

type SutTypes = {
  sut: MqPublishInExchangeMiddleware;
  publishInExchangeStub: PublishInExchangeStub;
  errorHandler: ErrorHandler;
  logger: Logger;
};

type FactoryParams = {
  routingKey: string;
  exchange: string;
  context: 'PUBLISH_EXAMPLE';
};

const makeSut = ({
  context,
  exchange,
  routingKey
}: FactoryParams): SutTypes => {
  const publishInExchangeStub = new PublishInExchangeStub();
  const extractValuesSchema = {
    PUBLISH_EXAMPLE: ['state.publishExample']
  };

  const errorHandler = makeErrorHandlerStub();
  const logger = new LoggerStub();

  const extractValue = extractValuesSchema[context];
  const sut = new MqPublishInExchangeMiddleware(
    {
      exchange,
      routingKey
    },
    publishInExchangeStub,
    errorHandler,
    logger,
    extractValue
  );

  return {
    sut,
    publishInExchangeStub,
    errorHandler,
    logger
  };
};

describe('MqPublishInExchangeMiddleware', () => {
  const request: any = {};
  const state: any = {
    publishExample: [ModelMock]
  };
  const setState = jest.fn();
  const next = jest.fn();

  beforeAll(() => {
    jest.spyOn(StateLogger, 'log').mockReturnValue();
  });

  it('Should call publishInExchange witch correct values', async () => {
    const { sut, publishInExchangeStub } = makeSut({
      context: 'PUBLISH_EXAMPLE',
      exchange: 'example',
      routingKey: 'example'
    });

    const publishSpy = jest.spyOn(publishInExchangeStub, 'publish');

    await sut.handle(request, [state, setState], next);

    const expected = {
      exchange: 'example',
      routingKey: 'example',
      value: { publishExample: [ModelMock] }
    };

    expect(publishSpy).toHaveBeenCalledTimes(1);
    expect(publishSpy).toHaveBeenCalledWith(expected);
  });

  it('Should call logger witch correct values', async () => {
    const { sut, logger } = makeSut({
      context: 'PUBLISH_EXAMPLE',
      exchange: 'example',
      routingKey: 'example'
    });

    const logSpy = jest.spyOn(logger, 'log');

    await sut.handle(request, [state, setState], next);

    const expected = {
      level: 'debug',
      message: 'PUBLISH IN EXCHANGE',
      payload: { publishExample: [ModelMock] }
    };

    expect(logSpy).toHaveBeenCalledTimes(1);
    expect(logSpy).toHaveBeenCalledWith(expected);
  });

  it('Should return 500 if a unknown error throws', async () => {
    const { sut, publishInExchangeStub, errorHandler } = makeSut({
      context: 'PUBLISH_EXAMPLE',
      exchange: 'example',
      routingKey: 'example'
    });

    jest
      .spyOn(publishInExchangeStub, 'publish')
      .mockRejectedValueOnce(new Error('Unknown Error.'));

    const errorHandlerSpy = jest.spyOn(errorHandler, 'handle');
    const result = await sut.handle(request, [state, setState], next);

    const expected = makeServerErrorMock();
    expect(result).toStrictEqual(expected);
    expect(errorHandlerSpy).toHaveBeenCalledTimes(1);
  });
});
