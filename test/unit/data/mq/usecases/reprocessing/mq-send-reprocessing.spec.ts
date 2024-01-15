import {
  PublishInExchangeServiceStub,
  PublishInQueueServiceStub,
  SaveReprocessingDataRepositoryStub
} from '@/test/unit/data/mq/mocks';
import { MqSendReprocessing } from '@/data/usecases/mq';

type SutTypes = {
  sut: MqSendReprocessing;
  saveReprocessingDataRepositoryStub: SaveReprocessingDataRepositoryStub;
  publishInExchangeServiceStub: PublishInExchangeServiceStub;
  publishInQueueServiceStub: PublishInQueueServiceStub;
};

type FactoryParams = {
  queueOptions: {
    queue: string;
    exchange?: string;
    routingKey?: string;
  };
  maxTries: number;
  delays: number[];
};

const makeSut = ({
  delays,
  maxTries,
  queueOptions
}: FactoryParams): SutTypes => {
  const saveReprocessingDataRepositoryStub =
    new SaveReprocessingDataRepositoryStub();
  const publishInExchangeServiceStub = new PublishInExchangeServiceStub();
  const publishInQueueServiceStub = new PublishInQueueServiceStub();

  const sut = new MqSendReprocessing(
    publishInExchangeServiceStub,
    publishInQueueServiceStub,
    saveReprocessingDataRepositoryStub,
    queueOptions,
    maxTries,
    delays
  );

  return {
    sut,
    saveReprocessingDataRepositoryStub,
    publishInExchangeServiceStub,
    publishInQueueServiceStub
  };
};

describe('MqSendReprocessing UseCase', () => {
  it('Should publish in queue if reprocessing tries is not defined', async () => {
    const queueOptions = { queue: 'any_queue' };
    const maxTries = 3;
    const delays = [1000, 2000, 3000];

    const { sut, publishInQueueServiceStub } = makeSut({
      delays,
      maxTries,
      queueOptions
    });

    const payload = { headers: {} };
    const state = {
      getAccountByIdentifier: {},
      reprocessing: { tries: undefined }
    };

    const publishInQueue = jest.spyOn(
      publishInQueueServiceStub,
      'publishInQueue'
    );

    await sut.reprocess({
      middleware: 'any_middleware',
      tries: null,
      data: { payload, state }
    });

    expect(publishInQueue).toHaveBeenCalledWith(
      queueOptions.queue,
      {
        reprocessing: {
          middleware: 'any_middleware',
          progress: undefined,
          tries: { current: 1, max: maxTries, delays },
          data: {
            payload,
            state: { getAccountByIdentifier: {} }
          }
        }
      },
      payload.headers
    );
  });

  it('Should publish in exchange if reprocessing tries is not defined and exchange is specified', async () => {
    const queueOptions = {
      queue: 'any_queue',
      exchange: 'any_exchange',
      routingKey: 'any_routing_key'
    };
    const maxTries = 3;
    const delays = [1000, 2000, 3000];

    const { sut, publishInExchangeServiceStub } = makeSut({
      delays,
      maxTries,
      queueOptions
    });

    const publishInExchange = jest.spyOn(
      publishInExchangeServiceStub,
      'publishInExchange'
    );

    const payload = { headers: {} };
    const state = {
      getAccountByIdentifier: {},
      reprocessing: { tries: undefined }
    };

    await sut.reprocess({
      data: { payload, state },
      middleware: 'any_middleware',
      progress: undefined,
      tries: null
    });

    expect(publishInExchange).toHaveBeenCalledWith(
      queueOptions.exchange,
      {
        reprocessing: {
          middleware: 'any_middleware',
          progress: undefined,
          tries: { current: 1, max: maxTries, delays },
          data: {
            payload,
            state: { getAccountByIdentifier: {} }
          }
        }
      },
      queueOptions.routingKey,
      { ...payload.headers, 'x-delay': delays[0] }
    );
  });

  it('Should publish in queue if reprocessing tries is less than max', async () => {
    const queueOptions = {
      queue: 'any_queue'
    };

    const maxTries = 3;
    const delays = [1000, 2000, 3000];
    const { sut, publishInQueueServiceStub } = makeSut({
      delays,
      maxTries,
      queueOptions
    });

    const publishInQueue = jest.spyOn(
      publishInQueueServiceStub,
      'publishInQueue'
    );

    const tries = { current: 1, max: maxTries, delays };
    const payload = { headers: {} };
    const state = {
      reprocessing: { tries },
      getAccountByIdentifier: {}
    };

    await sut.reprocess({
      data: { payload, state },
      middleware: 'any_middleware',
      tries
    });

    expect(publishInQueue).toHaveBeenCalledWith(
      queueOptions.queue,
      {
        reprocessing: {
          middleware: 'any_middleware',
          progress: undefined,
          tries: { current: 2, max: maxTries, delays },
          data: { payload, state: { getAccountByIdentifier: {} } }
        }
      },
      payload.headers
    );
  });

  it('Should publish in exchange if reprocessing tries is less than max and exchange is specified', async () => {
    const queueOptions = {
      queue: 'any_queue',
      exchange: 'any_exchange',
      routingKey: 'any_routing_key'
    };
    const maxTries = 4;
    const delays = [1000, 2000, 3000];

    const { sut, publishInExchangeServiceStub } = makeSut({
      delays,
      maxTries,
      queueOptions
    });

    const publishInExchange = jest.spyOn(
      publishInExchangeServiceStub,
      'publishInExchange'
    );
    const tries = { current: 1, max: maxTries, delays };
    const payload = { headers: {} };

    const state = {
      getAccountByIdentifier: {},
      reprocessing: { tries }
    };

    await sut.reprocess({
      data: { payload, state },
      middleware: 'any_middleware',
      progress: undefined,
      tries
    });

    expect(publishInExchange).toHaveBeenCalledWith(
      queueOptions.exchange,
      {
        reprocessing: {
          middleware: 'any_middleware',
          progress: undefined,
          tries: { current: 2, max: maxTries, delays },
          data: { payload, state: { getAccountByIdentifier: {} } }
        }
      },
      queueOptions.routingKey,
      { ...payload.headers, 'x-delay': tries.delays[tries.current - 1] }
    );
  });

  it('Should save in repository if reprocessing tries exceeds max', async () => {
    const queueOptions = {
      queue: 'any_queue',
      exchange: 'any_exchange',
      routingKey: 'any_routing_key'
    };

    const maxTries = 3;
    const delays = [1000, 2000, 3000];

    const { sut, saveReprocessingDataRepositoryStub } = makeSut({
      delays,
      maxTries,
      queueOptions
    });

    const saveSpy = jest.spyOn(saveReprocessingDataRepositoryStub, 'save');

    const tries = { current: 4, max: maxTries, delays };
    const payload = { headers: {} };
    const state = { reprocessing: { tries }, getAccountByIdentifier: {} };

    await sut.reprocess({
      data: { payload, state },
      middleware: 'any_middleware',
      progress: undefined,
      tries
    });

    expect(saveSpy).toHaveBeenCalledWith({
      exchange: queueOptions.exchange,
      message: {
        reprocessing: {
          middleware: 'any_middleware',
          progress: undefined,
          tries: { current: 5, max: maxTries, delays },
          data: { payload, state: { getAccountByIdentifier: {} } }
        }
      },
      routingKey: queueOptions.routingKey,
      queue: queueOptions.queue
    });
  });

  it('Should save in repository if reprocessing tries exceeds max without specifying routingKey', async () => {
    const queueOptions = {
      queue: 'any_queue',
      exchange: 'any_exchange'
    };

    const maxTries = 3;
    const delays = [1000, 2000, 3000];

    const { sut, saveReprocessingDataRepositoryStub } = makeSut({
      delays,
      maxTries,
      queueOptions
    });

    const saveSpy = jest.spyOn(saveReprocessingDataRepositoryStub, 'save');

    const tries = { current: 4, max: maxTries, delays };
    const payload = { headers: {} };
    const state = { reprocessing: { tries }, getAccountByIdentifier: {} };

    await sut.reprocess({
      data: { payload, state },
      middleware: 'any_middleware',
      progress: undefined,
      tries
    });

    expect(saveSpy).toHaveBeenCalledWith({
      exchange: queueOptions.exchange,
      message: {
        reprocessing: {
          middleware: 'any_middleware',
          progress: undefined,
          tries: { current: 5, max: maxTries, delays },
          data: { payload, state: { getAccountByIdentifier: {} } }
        }
      },
      routingKey: '',
      queue: queueOptions.queue
    });
  });

  it('Should publish in exchange if reprocessing tries is less than max and exchange is specified without specifying routingKey', async () => {
    const queueOptions = {
      queue: 'any_queue',
      exchange: 'any_exchange'
    };
    const maxTries = 4;
    const delays = [1000, 2000, 3000];

    const { sut, publishInExchangeServiceStub } = makeSut({
      delays,
      maxTries,
      queueOptions
    });

    const publishInExchange = jest.spyOn(
      publishInExchangeServiceStub,
      'publishInExchange'
    );
    const tries = { current: 1, max: maxTries, delays };
    const payload = { headers: {} };

    const state = {
      getAccountByIdentifier: {},
      reprocessing: { tries }
    };

    await sut.reprocess({
      data: { payload, state },
      middleware: 'any_middleware',
      progress: undefined,
      tries
    });

    expect(publishInExchange).toHaveBeenCalledWith(
      queueOptions.exchange,
      {
        reprocessing: {
          middleware: 'any_middleware',
          progress: undefined,
          tries: { current: 2, max: maxTries, delays },
          data: { payload, state: { getAccountByIdentifier: {} } }
        }
      },
      '',
      { ...payload.headers, 'x-delay': tries.delays[tries.current - 1] }
    );
  });

  it('Should publish in exchange if reprocessing tries is not defined and exchange is specified without specifying routingKey', async () => {
    const queueOptions = {
      queue: 'any_queue',
      exchange: 'any_exchange'
    };
    const maxTries = 3;
    const delays = [1000, 2000, 3000];

    const { sut, publishInExchangeServiceStub } = makeSut({
      delays,
      maxTries,
      queueOptions
    });

    const publishInExchange = jest.spyOn(
      publishInExchangeServiceStub,
      'publishInExchange'
    );

    const payload = { headers: {} };
    const state = {
      getAccountByIdentifier: {},
      reprocessing: { tries: undefined }
    };

    await sut.reprocess({
      data: { payload, state },
      middleware: 'any_middleware',
      progress: undefined,
      tries: null
    });

    expect(publishInExchange).toHaveBeenCalledWith(
      queueOptions.exchange,
      {
        reprocessing: {
          middleware: 'any_middleware',
          progress: undefined,
          tries: { current: 1, max: maxTries, delays },
          data: {
            payload,
            state: { getAccountByIdentifier: {} }
          }
        }
      },
      '',
      { ...payload.headers, 'x-delay': delays[0] }
    );
  });
});
