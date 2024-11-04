import type { Server as HttpServer } from 'http';
import { Server as SocketServer, type Socket } from 'socket.io';

import makeFlow from '@/main/adapters/flow-adapter';
import type { Middleware, SharedState } from '@/presentation/protocols';
import {
  convertCamelCaseKeysToSnakeCase,
  convertSnakeCaseKeysToCamelCase,
  logger
} from '@/util';

import { SocketHandler } from '../web-server/socket-handler';
import {
  EVENT_KEY,
  REQUEST_KEY,
  SOCKET_KEY,
  STATE_KEY,
  type Payload,
  type RouteMiddlewareSocket,
  type WebSocketCallbackMetadata
} from '../web-server/types';

type Transport = 'polling' | 'websocket' | 'webtransport';

export type WebSocketServerOptions = {
  path: string;
  enabled: boolean;
  cors: {
    origin: string | string[];
    methods: string[];
  };
  transports: Transport[];
};

export class WebSocketServer {
  private ws!: SocketServer;
  private static instance: WebSocketServer;

  private constructor(
    private readonly httpServer: HttpServer,
    private readonly options: WebSocketServerOptions
  ) {
    this.ws = new SocketServer(this.httpServer, {
      cors: this.options.cors,
      path: this.options.path,
      transports: this.options.transports
    });
  }

  static getInstance(httpServer: HttpServer, options: WebSocketServerOptions) {
    if (!this.instance) {
      this.instance = new WebSocketServer(httpServer, options);
    }

    return this.instance;
  }

  private makeSetStateInRequest(source: Record<string, unknown>) {
    return <T>(state: T) => {
      for (const key in state) {
        if (typeof key === 'string' || typeof key === 'number')
          source[key] = state[key];
      }
    };
  }

  public adapter(middleware: RouteMiddlewareSocket, method: string) {
    return async (
      {
        [STATE_KEY]: state,
        [SOCKET_KEY]: socket,
        [REQUEST_KEY]: request
      }: Payload,
      next: Middleware.Next
    ) => {
      const stateHook = <[SharedState, <T>(state: T) => void]>[
        state,
        this.makeSetStateInRequest(state)
      ];

      const response = await (typeof middleware !== 'function'
        ? middleware.handle(request, stateHook, next)
        : middleware(socket, request, next, stateHook));

      if (!response) return;

      const { statusCode: httpStatusCode, ...data } = response;

      const { options = null, ...payload } = data;

      socket.emit(
        method,
        convertCamelCaseKeysToSnakeCase({
          httpStatusCode,
          ...payload
        })
      );

      if (options?.close) socket.disconnect();
    };
  }

  private adaptMiddlewaresWebSocket(
    middlewares: RouteMiddlewareSocket[],
    method: string
  ) {
    return middlewares.map((middleware) => this.adapter(middleware, method));
  }

  private adapterWebsocketWithFlow(
    handlers: Map<string, Nullable<WebSocketCallbackMetadata>>
  ): (socket: Socket) => Promise<void> {
    return async (socket) => {
      try {
        for (const [_, metadata] of handlers) {
          if (!metadata) continue;

          const { middlewares, method } = metadata;

          socket.on(method, async (request) => {
            try {
              const _request = {
                ...convertSnakeCaseKeysToCamelCase(request),
                [STATE_KEY]: {},
                [EVENT_KEY]: method
              };
              await makeFlow({
                [REQUEST_KEY]: _request,
                [STATE_KEY]: _request[STATE_KEY],
                [SOCKET_KEY]: socket
              })(...this.adaptMiddlewaresWebSocket(middlewares, method))();
            } catch (error) {
              socket.disconnect();
              logger.log({
                level: 'error',
                message:
                  'An error occurred while processing the websocket connection',
                error
              });
            }
          });
        }
      } catch (error) {
        logger.log({
          level: 'error',
          message:
            'An error occurred while processing the websocket connection',
          error
        });
      }
    };
  }

  public bootstrap() {
    this.execute();
  }

  private execute() {
    if (!this.options.enabled) {
      logger.log({
        level: 'warn',
        message: '[CAUTION] Websocket is disabled and will not be initialized!'
      });
      return;
    }

    this.ws.on(
      'connection',
      this.adapterWebsocketWithFlow(SocketHandler.getSocketHandlersCallbacks())
    );
  }
}
