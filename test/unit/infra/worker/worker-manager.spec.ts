import { WorkerManager } from '@/infra/worker/worker-manager';

jest.mock('fs', () => ({
  ...jest.requireActual('fs'),
  readdirSync: jest.fn().mockReturnValue([])
}));

const agendaOnMock = jest.fn().mockReturnThis();
const agendaDatabaseMock = jest.fn().mockReturnThis();
const agendaDefineMock = jest.fn();
const agendaEveryMock = jest.fn().mockResolvedValue(undefined);
const agendaStartMock = jest.fn().mockResolvedValue(undefined);
const agendaStopMock = jest.fn().mockResolvedValue(undefined);

jest.mock('@hokify/agenda', () => ({
  Agenda: jest.fn().mockImplementation(() => ({
    on: agendaOnMock,
    database: agendaDatabaseMock,
    define: agendaDefineMock,
    every: agendaEveryMock,
    start: agendaStartMock,
    stop: agendaStopMock
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
    AUTH_SOURCE: 'admin'
  },
  WORKER: { LIST: [] }
}));

beforeEach(() => {
  (WorkerManager as any).instance = undefined;
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
    });
  });

  describe('#stop', () => {
    it('should call agenda.stop', async () => {
      const { sut } = makeSut();
      await sut.stop();
      expect(agendaStopMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('#makeWorker', () => {
    it('should define and schedule a repeating worker', async () => {
      const { sut } = makeSut();
      const job = jest.fn();

      await sut.makeWorker({ name: 'my-job', repeatInterval: '1 minute' }, job);

      expect(agendaDefineMock).toHaveBeenCalledWith(
        'my-job',
        expect.any(Function)
      );
      expect(agendaEveryMock).toHaveBeenCalledWith('1 minute', 'my-job', {});
    });

    it('should define a worker without scheduling when no repeatInterval', async () => {
      const { sut } = makeSut();

      await sut.makeWorker({ name: 'one-shot' }, jest.fn());

      expect(agendaDefineMock).toHaveBeenCalledWith(
        'one-shot',
        expect.any(Function)
      );
      expect(agendaEveryMock).not.toHaveBeenCalled();
    });

    it('should skip disabled worker when not in allowAll/allow list', async () => {
      const { sut } = makeSut();

      await sut.makeWorker({ name: 'disabled-job', enabled: false }, jest.fn());

      expect(agendaDefineMock).not.toHaveBeenCalled();
    });

    it('should register disabled worker when enabled option is true explicitly', async () => {
      const { sut } = makeSut();

      await sut.makeWorker({ name: 'forced-job', enabled: true }, jest.fn());

      expect(agendaDefineMock).toHaveBeenCalled();
    });
  });

  describe('worker loader options from WORKER.LIST', () => {
    it('should deny worker when its name is prefixed with ! in WORKER_LIST', async () => {
      const { WORKER } = jest.requireMock('@/util');
      WORKER.LIST = ['!blocked-job'];
      const sut = new WorkerManager();

      await sut.makeWorker({ name: 'blocked-job' }, jest.fn());

      expect(agendaDefineMock).not.toHaveBeenCalled();
      WORKER.LIST = [];
    });

    it('should allow all workers when WORKER_LIST contains *', async () => {
      const { WORKER } = jest.requireMock('@/util');
      WORKER.LIST = ['*'];
      const sut = new WorkerManager();

      await sut.makeWorker({ name: 'any-job', enabled: false }, jest.fn());

      expect(agendaDefineMock).toHaveBeenCalled();
      WORKER.LIST = [];
    });

    it('should deny all workers when WORKER_LIST contains !*', async () => {
      const { WORKER } = jest.requireMock('@/util');
      WORKER.LIST = ['!*'];
      const sut = new WorkerManager();

      await sut.makeWorker({ name: 'some-job' }, jest.fn());

      expect(agendaDefineMock).not.toHaveBeenCalled();
      WORKER.LIST = [];
    });

    it('should allow explicitly listed worker even when denyAll is set', async () => {
      const { WORKER } = jest.requireMock('@/util');
      WORKER.LIST = ['!*', 'allowed-job'];
      const sut = new WorkerManager();

      await sut.makeWorker({ name: 'allowed-job' }, jest.fn());

      expect(agendaDefineMock).toHaveBeenCalled();
      WORKER.LIST = [];
    });
  });

  describe('agenda event callbacks', () => {
    it('should log on fail event', () => {
      const { logger } = jest.requireMock('@/util');
      makeSut();
      const failCallback = agendaOnMock.mock.calls.find(
        ([event]) => event === 'fail'
      )?.[1];
      failCallback?.(new Error('job failed'));
      expect(logger.log).toHaveBeenCalledWith(
        expect.objectContaining({ level: 'error' })
      );
    });

    it('should log on ready event', () => {
      const { logger } = jest.requireMock('@/util');
      makeSut();
      const readyCallback = agendaOnMock.mock.calls.find(
        ([event]) => event === 'ready'
      )?.[1];
      readyCallback?.();
      expect(logger.log).toHaveBeenCalledWith(
        expect.objectContaining({ level: 'info' })
      );
    });

    it('should log on start event', () => {
      const { logger } = jest.requireMock('@/util');
      makeSut();
      const startCallback = agendaOnMock.mock.calls.find(
        ([event]) => event === 'start'
      )?.[1];
      startCallback?.();
      expect(logger.log).toHaveBeenCalledWith(
        expect.objectContaining({ level: 'info' })
      );
    });

    it('should log on error event', () => {
      const { logger } = jest.requireMock('@/util');
      makeSut();
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

      await sut.makeWorker({ name: 'cb-job' }, job);

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
