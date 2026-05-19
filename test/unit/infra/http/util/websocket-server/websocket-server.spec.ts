import { WebSocketServer } from '@/infra/http/util/websocket-server/websocket-server';
import {
  STATE_KEY,
  SOCKET_KEY,
  REQUEST_KEY
} from '@/infra/http/util/web-server/types';

const mockWsOn = jest.fn();
const mockWsEmit = jest.fn();
const mockSocketDisconnect = jest.fn();
const mockSocketEmit = jest.fn();
const mockSocketOn = jest.fn();

jest.mock('socket.io', () => ({
  Server: jest.fn().mockImplementation(() => ({
    on: mockWsOn,
    emit: mockWsEmit
  }))
}));

jest.mock('@/util', () => ({
  logger: { log: jest.fn() },
  convertCamelCaseKeysToSnakeCase: jest.fn().mockImplementation((x) => x),
  convertSnakeCaseKeysToCamelCase: jest.fn().mockImplementation((x) => x)
}));

jest.mock('@/main/adapters/flow-adapter', () =>
  jest.fn().mockReturnValue((...middlewares: Function[]) => async () => {
    for (const m of middlewares) await m({}, () => {});
  })
);

jest.mock('@/infra/http/util/web-server/socket-handler', () => ({
  SocketHandler: {
    getSocketHandlersCallbacks: jest.fn().mockReturnValue(new Map())
  }
}));

const makeOptions = (enabled = true) => ({
  path: '/socket.io',
  enabled,
  cors: { origin: '*', methods: ['GET', 'POST'] },
  transports: ['websocket' as const]
});

const makeHttpServer = () => ({}) as any;

beforeEach(() => {
  (WebSocketServer as any).instance = undefined;
});

type SutTypes = { sut: WebSocketServer };
const makeSut = (enabled = true): SutTypes => ({
  sut: WebSocketServer.getInstance(makeHttpServer(), makeOptions(enabled))
});

describe('WebSocketServer', () => {
  describe('getInstance', () => {
    it('should return the same instance on multiple calls', () => {
      const a = WebSocketServer.getInstance(makeHttpServer(), makeOptions());
      const b = WebSocketServer.getInstance(makeHttpServer(), makeOptions());
      expect(a).toBe(b);
    });
  });

  describe('#bootstrap', () => {
    it('should log a warning and not register connection when disabled', () => {
      const { logger } = jest.requireMock('@/util');
      const { sut } = makeSut(false);
      sut.bootstrap();
      expect(logger.log).toHaveBeenCalledWith(
        expect.objectContaining({ level: 'warn' })
      );
      expect(mockWsOn).not.toHaveBeenCalled();
    });

    it('should register the connection handler when enabled', () => {
      const { sut } = makeSut(true);
      sut.bootstrap();
      expect(mockWsOn).toHaveBeenCalledWith('connection', expect.any(Function));
    });

    it('should iterate socket handlers on connection', async () => {
      const mockSocketHandlers = jest.requireMock(
        '@/infra/http/util/web-server/socket-handler'
      );
      const handlers = new Map([
        [
          'test-event',
          {
            method: 'test-event',
            middlewares: []
          }
        ]
      ]);
      mockSocketHandlers.SocketHandler.getSocketHandlersCallbacks.mockReturnValue(
        handlers
      );

      const { sut } = makeSut(true);
      sut.bootstrap();

      const connectionHandler = mockWsOn.mock.calls[0][1];
      const socket = {
        on: mockSocketOn,
        disconnect: mockSocketDisconnect,
        emit: mockSocketEmit
      };
      await connectionHandler(socket);

      expect(mockSocketOn).toHaveBeenCalledWith(
        'test-event',
        expect.any(Function)
      );
    });
  });

  describe('#adapterWebsocketWithFlow - socket event callback', () => {
    it('should invoke adaptMiddlewaresWebSocket and run middleware when socket event fires', async () => {
      const mockSocketHandlers = jest.requireMock(
        '@/infra/http/util/web-server/socket-handler'
      );
      const middleware = {
        handle: jest.fn().mockResolvedValue({ statusCode: 200 })
      };
      const handlers = new Map([
        ['room-event', { method: 'room-event', middlewares: [middleware] }]
      ]);
      mockSocketHandlers.SocketHandler.getSocketHandlersCallbacks.mockReturnValue(
        handlers
      );

      const { sut } = makeSut(true);
      sut.bootstrap();

      const connectionHandler = mockWsOn.mock.calls.find(
        ([ev]) => ev === 'connection'
      )?.[1];
      const socket = {
        on: jest.fn(),
        emit: mockSocketEmit,
        disconnect: mockSocketDisconnect
      };
      await connectionHandler(socket);

      const eventCallback = (socket.on as jest.Mock).mock.calls.find(
        ([ev]) => ev === 'room-event'
      )?.[1];
      if (eventCallback) {
        await eventCallback({ payload: 'data' });
      }

      expect(socket.on).toHaveBeenCalledWith(
        'room-event',
        expect.any(Function)
      );
    });

    it('should disconnect socket on error during socket event processing', async () => {
      const mockSocketHandlers = jest.requireMock(
        '@/infra/http/util/web-server/socket-handler'
      );
      const throwingMiddleware = {
        handle: jest.fn().mockRejectedValue(new Error('handler error'))
      };
      const handlers = new Map([
        [
          'err-event',
          { method: 'err-event', middlewares: [throwingMiddleware] }
        ]
      ]);
      mockSocketHandlers.SocketHandler.getSocketHandlersCallbacks.mockReturnValue(
        handlers
      );

      const { sut } = makeSut(true);
      sut.bootstrap();

      const connectionHandler = mockWsOn.mock.calls.find(
        ([ev]) => ev === 'connection'
      )?.[1];
      const socket = {
        on: jest.fn(),
        emit: mockSocketEmit,
        disconnect: mockSocketDisconnect
      };
      await connectionHandler(socket);

      const eventCallback = (socket.on as jest.Mock).mock.calls.find(
        ([ev]) => ev === 'err-event'
      )?.[1];
      if (eventCallback) {
        await eventCallback({}).catch(() => {});
      }
    });
  });

  describe('#adapter', () => {
    const makePayload = (socket: object) =>
      ({
        [STATE_KEY]: {},
        [SOCKET_KEY]: socket,
        [REQUEST_KEY]: {}
      }) as any;

    it('should call middleware handle method and emit response', async () => {
      const { sut } = makeSut();
      const socket = { emit: mockSocketEmit, disconnect: mockSocketDisconnect };
      const middleware = {
        handle: jest.fn().mockResolvedValue({ statusCode: 200, data: 'ok' })
      };
      const adapted = sut.adapter(middleware as any, 'my-event');
      await adapted(makePayload(socket), jest.fn());
      expect(middleware.handle).toHaveBeenCalled();
      expect(mockSocketEmit).toHaveBeenCalled();
    });

    it('should call function middleware and emit response', async () => {
      const { sut } = makeSut();
      const socket = { emit: mockSocketEmit, disconnect: mockSocketDisconnect };
      const middlewareFn = jest
        .fn()
        .mockResolvedValue({ statusCode: 200, body: 'result' });
      const adapted = sut.adapter(middlewareFn as any, 'my-event');
      await adapted(makePayload(socket), jest.fn());
      expect(middlewareFn).toHaveBeenCalled();
      expect(mockSocketEmit).toHaveBeenCalled();
    });

    it('should disconnect socket when options.close is true', async () => {
      const { sut } = makeSut();
      const socket = { emit: mockSocketEmit, disconnect: mockSocketDisconnect };
      const middleware = {
        handle: jest
          .fn()
          .mockResolvedValue({ statusCode: 200, options: { close: true } })
      };
      const adapted = sut.adapter(middleware as any, 'my-event');
      await adapted(makePayload(socket), jest.fn());
      expect(mockSocketDisconnect).toHaveBeenCalled();
    });

    it('should update state object when setState from stateHook is called', async () => {
      const { sut } = makeSut();
      const socket = { emit: mockSocketEmit, disconnect: mockSocketDisconnect };
      const state: Record<string, unknown> = {};
      const middleware = {
        handle: jest
          .fn()
          .mockImplementation((_req: unknown, stateHook: unknown[]) => {
            const setState = stateHook[1] as (
              s: Record<string, unknown>
            ) => void;
            setState({ userId: 'abc', role: 'admin' });
            return Promise.resolve({ statusCode: 200 });
          })
      };
      const adapted = sut.adapter(middleware as any, 'my-event');
      await adapted(
        { [STATE_KEY]: state, [SOCKET_KEY]: socket, [REQUEST_KEY]: {} } as any,
        jest.fn()
      );
      expect(state).toMatchObject({ userId: 'abc', role: 'admin' });
    });

    it('should not emit when middleware returns nothing', async () => {
      const { sut } = makeSut();
      const socket = { emit: mockSocketEmit, disconnect: mockSocketDisconnect };
      const middleware = { handle: jest.fn().mockResolvedValue(undefined) };
      const adapted = sut.adapter(middleware as any, 'my-event');
      await adapted(makePayload(socket), jest.fn());
      expect(mockSocketEmit).not.toHaveBeenCalled();
    });
  });
});
