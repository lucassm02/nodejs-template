import { WorkerManager } from '@/infra/worker/worker-manager';

jest.mock('fs', () => ({
  ...jest.requireActual('fs'),
  readdirSync: jest.fn().mockReturnValue([])
}));

const agendaOnMock = jest.fn().mockReturnThis();
const agendaDefineMock = jest.fn();
const agendaEveryMock = jest.fn().mockResolvedValue(undefined);
const agendaStartMock = jest.fn().mockResolvedValue(undefined);
const agendaStopMock = jest.fn().mockResolvedValue(undefined);
const mockMongoBackendConstructor = jest.fn();
const mongoBackendConnectMock = jest.fn().mockResolvedValue(undefined);
const mongoClientConnectMock = jest.fn().mockResolvedValue(undefined);
const mongoClientCloseMock = jest.fn().mockResolvedValue(undefined);
const mongoDatabase = {};
const mongoClientDbMock = jest.fn().mockReturnValue(mongoDatabase);

jest.mock('agenda', () => ({
  Agenda: jest.fn().mockImplementation(() => ({
    on: agendaOnMock,
    define: agendaDefineMock,
    every: agendaEveryMock,
    start: agendaStartMock,
    stop: agendaStopMock
  }))
}));

jest.mock('@agendajs/mongo-backend', () => ({
  MongoBackend: jest.fn().mockImplementation((config) => {
    mockMongoBackendConstructor(config);
    return { connect: mongoBackendConnectMock };
  }),
  MongoClient: jest.fn().mockImplementation(() => ({
    connect: mongoClientConnectMock,
    close: mongoClientCloseMock,
    db: mongoClientDbMock
  }))
}));

jest.mock('@/main/adapters', () => ({
  jobAdapter:
    (...cbs: Function[]) =>
    async (payload: unknown) => {
      for (const cb of cbs) await cb(payload);
    }
}));

jest.mock('@/util', () => ({
  elasticAPM: jest.fn().mockReturnValue({ getAPM: () => null }),
  logger: { log: jest.fn() },
  apmTransaction: () => (_t: object, _k: string, desc: PropertyDescriptor) =>
    desc,
  workerLogger: () => (_t: object, _k: string, desc: PropertyDescriptor) =>
    desc,
  MONGO: {
    URL: () => 'mongodb://localhost:27017',
    NAME: 'test',
    AUTH_SOURCE: 'admin',
    CONNECTION_TIMEOUT_MS: 1000,
    MAX_POOL_SIZE: 10,
    MIN_POOL_SIZE: 1
  },
  WORKER: { LIST: [] }
}));

beforeEach(() => {
  Reflect.set(WorkerManager, 'instance', undefined);
});

type SutTypes = { sut: WorkerManager };
const makeSut = (): SutTypes => ({ sut: new WorkerManager() });

describe('WorkerManager', () => {
  describe('getInstance', () => {
    it('should return the same instance on multiple calls', () => {
      const a = WorkerManager.getInstance();
      const b = WorkerManager.getInstance();
      expect(a).toBe(b);
    });
  });

  describe('#start', () => {
    it('should call agenda.start', async () => {
      const { sut } = makeSut();
      await sut.start();
      expect(agendaStartMock).toHaveBeenCalledTimes(1);
      expect(mongoClientConnectMock).toHaveBeenCalledTimes(1);
      expect(mongoBackendConnectMock).toHaveBeenCalledTimes(1);
      expect(mockMongoBackendConstructor).toHaveBeenCalledWith({
        mongo: mongoDatabase,
        collection: 'agenda'
      });
    });

    it('should propagate MongoDB connection errors and close the client', async () => {
      const connectionError = new Error('MongoDB unavailable');
      mongoClientConnectMock.mockRejectedValueOnce(connectionError);
      const { sut } = makeSut();

      await expect(sut.start()).rejects.toThrow(connectionError);

      expect(agendaStartMock).not.toHaveBeenCalled();
      expect(mongoClientCloseMock).toHaveBeenCalledTimes(1);
    });

    it('should wait for worker registrations before starting Agenda', async () => {
      let finishRegistration: () => void = () => undefined;
      agendaEveryMock.mockReturnValueOnce(
        new Promise<void>((resolveRegistration) => {
          finishRegistration = resolveRegistration;
        })
      );
      const { sut } = makeSut();

      sut.makeWorker(
        { name: 'delayed-job', repeatInterval: '1 minute' },
        jest.fn()
      );
      const starting = sut.start();
      const earlyResult = await Promise.race([
        starting.then(() => 'resolved'),
        new Promise((resolveResult) => {
          setTimeout(() => resolveResult('pending'), 20);
        })
      ]);

      expect(earlyResult).toBe('pending');
      expect(agendaStartMock).not.toHaveBeenCalled();
      finishRegistration();
      await expect(starting).resolves.toBeUndefined();
      expect(agendaStartMock).toHaveBeenCalledTimes(1);
    });

    it('should propagate worker registration errors from start', async () => {
      const registrationError = new Error('Could not schedule worker');
      agendaEveryMock.mockRejectedValueOnce(registrationError);
      const { sut } = makeSut();

      sut.makeWorker(
        { name: 'invalid-job', repeatInterval: 'invalid' },
        jest.fn()
      );

      await expect(sut.start()).rejects.toThrow(registrationError);
      expect(agendaStartMock).not.toHaveBeenCalled();
      expect(mongoClientCloseMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('#stop', () => {
    it('should call agenda.stop', async () => {
      const { sut } = makeSut();
      await sut.stop();
      expect(agendaStopMock).toHaveBeenCalledTimes(1);
      expect(mongoClientCloseMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('#makeWorker', () => {
    it('should define and schedule a repeating worker', async () => {
      const { sut } = makeSut();
      const job = jest.fn();

      sut.makeWorker({ name: 'my-job', repeatInterval: '1 minute' }, job);
      await sut.start();

      expect(agendaDefineMock).toHaveBeenCalledWith(
        'my-job',
        expect.any(Function)
      );
      expect(agendaEveryMock).toHaveBeenCalledWith('1 minute', 'my-job', {});
    });

    it('should define a worker without scheduling when no repeatInterval', async () => {
      const { sut } = makeSut();

      sut.makeWorker({ name: 'one-shot' }, jest.fn());
      await sut.start();

      expect(agendaDefineMock).toHaveBeenCalledWith(
        'one-shot',
        expect.any(Function)
      );
      expect(agendaEveryMock).not.toHaveBeenCalled();
    });

    it('should skip disabled worker when not in allowAll/allow list', async () => {
      const { sut } = makeSut();

      sut.makeWorker({ name: 'disabled-job', enabled: false }, jest.fn());

      expect(agendaDefineMock).not.toHaveBeenCalled();
    });

    it('should register disabled worker when enabled option is true explicitly', async () => {
      const { sut } = makeSut();

      sut.makeWorker({ name: 'forced-job', enabled: true }, jest.fn());
      await sut.start();

      expect(agendaDefineMock).toHaveBeenCalled();
    });
  });

  describe('worker loader options from WORKER.LIST', () => {
    it('should deny worker when its name is prefixed with ! in WORKER_LIST', async () => {
      const { WORKER } = jest.requireMock('@/util');
      WORKER.LIST = ['!blocked-job'];
      const sut = new WorkerManager();

      sut.makeWorker({ name: 'blocked-job' }, jest.fn());

      expect(agendaDefineMock).not.toHaveBeenCalled();
      WORKER.LIST = [];
    });

    it('should allow all workers when WORKER_LIST contains *', async () => {
      const { WORKER } = jest.requireMock('@/util');
      WORKER.LIST = ['*'];
      const sut = new WorkerManager();

      sut.makeWorker({ name: 'any-job', enabled: false }, jest.fn());
      await sut.start();

      expect(agendaDefineMock).toHaveBeenCalled();
      WORKER.LIST = [];
    });

    it('should deny all workers when WORKER_LIST contains !*', async () => {
      const { WORKER } = jest.requireMock('@/util');
      WORKER.LIST = ['!*'];
      const sut = new WorkerManager();

      sut.makeWorker({ name: 'some-job' }, jest.fn());

      expect(agendaDefineMock).not.toHaveBeenCalled();
      WORKER.LIST = [];
    });

    it('should allow explicitly listed worker even when denyAll is set', async () => {
      const { WORKER } = jest.requireMock('@/util');
      WORKER.LIST = ['!*', 'allowed-job'];
      const sut = new WorkerManager();

      sut.makeWorker({ name: 'allowed-job' }, jest.fn());
      await sut.start();

      expect(agendaDefineMock).toHaveBeenCalled();
      WORKER.LIST = [];
    });
  });

  describe('agenda event callbacks', () => {
    it('should log on fail event', async () => {
      const { logger } = jest.requireMock('@/util');
      const { sut } = makeSut();
      await sut.start();
      const failCallback = agendaOnMock.mock.calls.find(
        ([event]) => event === 'fail'
      )?.[1];
      failCallback?.(new Error('job failed'));
      expect(logger.log).toHaveBeenCalledWith(
        expect.objectContaining({ level: 'error' })
      );
    });

    it('should log on ready event', async () => {
      const { logger } = jest.requireMock('@/util');
      const { sut } = makeSut();
      await sut.start();
      const readyCallback = agendaOnMock.mock.calls.find(
        ([event]) => event === 'ready'
      )?.[1];
      readyCallback?.();
      expect(logger.log).toHaveBeenCalledWith(
        expect.objectContaining({ level: 'info' })
      );
    });

    it('should log on start event', async () => {
      const { logger } = jest.requireMock('@/util');
      const { sut } = makeSut();
      await sut.start();
      const startCallback = agendaOnMock.mock.calls.find(
        ([event]) => event === 'start'
      )?.[1];
      startCallback?.();
      expect(logger.log).toHaveBeenCalledWith(
        expect.objectContaining({ level: 'info' })
      );
    });

    it('should log on error event', async () => {
      const { logger } = jest.requireMock('@/util');
      const { sut } = makeSut();
      await sut.start();
      const errorCallback = agendaOnMock.mock.calls.find(
        ([event]) => event === 'error'
      )?.[1];
      errorCallback?.(new Error('agenda error'));
      expect(logger.log).toHaveBeenCalledWith(
        expect.objectContaining({ level: 'error' })
      );
    });
  });

  describe('#makeWorker agenda.define callback', () => {
    it('should invoke the job callback and call done', async () => {
      const { sut } = makeSut();
      const job = jest.fn().mockResolvedValue(undefined);

      sut.makeWorker({ name: 'cb-job' }, job);
      await sut.start();

      const defineCallback = agendaDefineMock.mock.calls[0][1];
      const done = jest.fn();
      await defineCallback(
        { attrs: { data: { key: 'val' }, repeatInterval: '5 minutes' } },
        done
      );

      expect(done).toHaveBeenCalledTimes(1);
    });
  });

  describe('#tasksDirectory', () => {
    it('should load valid .ts files and skip spec files', async () => {
      const { readdirSync } = jest.requireMock('fs');
      readdirSync.mockReturnValue([
        'my-worker.ts',
        'my-worker.spec.ts',
        'my-worker.js.map'
      ]);
      const { sut } = makeSut();

      await expect(sut.tasksDirectory('/fake/path')).resolves.toBeUndefined();
    });

    it('should log error and skip when dynamic import fails', async () => {
      const { readdirSync } = jest.requireMock('fs');
      readdirSync.mockReturnValue(['bad-worker.ts']);
      const { logger } = jest.requireMock('@/util');
      const { sut } = makeSut();

      await expect(sut.tasksDirectory('/fake/path')).resolves.toBeUndefined();
      expect(logger.log).toHaveBeenCalled();
    });
  });
});
