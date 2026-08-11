import { bootstrapAgendaDashboard } from '@/main/agendash';

const fastifyRegisterMock = jest.fn();
const fastifyListenMock = jest.fn();
const fastifyCloseMock = jest.fn().mockResolvedValue(undefined);
const mongoClientCloseMock = jest.fn().mockResolvedValue(undefined);
const createFastifyPluginMock = jest.fn().mockReturnValue(jest.fn());
const mockAgenda = {};

jest.mock('fastify', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    register: fastifyRegisterMock,
    listen: fastifyListenMock,
    close: fastifyCloseMock
  }))
}));

jest.mock('agendash', () => ({
  createFastifyPlugin: createFastifyPluginMock
}));

jest.mock('@/infra/worker/create-mongo-agenda', () => ({
  createMongoAgenda: jest.fn().mockImplementation(async () => ({
    agenda: mockAgenda,
    mongoClient: { close: mongoClientCloseMock }
  }))
}));

jest.mock('@/util', () => ({
  WORKER: {
    DASHBOARD: { BASE_URI: '/dash', PORT: 8080 }
  },
  logger: { log: jest.fn() }
}));

describe('bootstrapAgendaDashboard', () => {
  it('should resolve only after Fastify starts listening', async () => {
    let finishListening: () => void = () => undefined;
    fastifyListenMock.mockReturnValueOnce(
      new Promise<string>((resolveListening) => {
        finishListening = () => resolveListening('http://127.0.0.1:8080');
      })
    );

    const bootstrapping = bootstrapAgendaDashboard();
    const earlyResult = await Promise.race([
      bootstrapping.then(() => 'resolved'),
      new Promise((resolveResult) => {
        setTimeout(() => resolveResult('pending'), 20);
      })
    ]);

    expect(earlyResult).toBe('pending');
    finishListening();
    const dashboard = await bootstrapping;

    expect(createFastifyPluginMock).toHaveBeenCalledWith(mockAgenda);
    expect(fastifyRegisterMock).toHaveBeenCalledWith(expect.any(Function), {
      prefix: '/dash'
    });
    expect(fastifyListenMock).toHaveBeenCalledWith({ port: 8080 });

    await dashboard.close();

    expect(fastifyCloseMock).toHaveBeenCalledTimes(1);
    expect(mongoClientCloseMock).toHaveBeenCalledTimes(1);
  });

  it('should close MongoDB when Fastify fails to listen', async () => {
    fastifyListenMock.mockRejectedValueOnce(new Error('address in use'));

    await expect(bootstrapAgendaDashboard()).rejects.toThrow('address in use');

    expect(fastifyCloseMock).toHaveBeenCalledTimes(1);
    expect(mongoClientCloseMock).toHaveBeenCalledTimes(1);
  });
});
