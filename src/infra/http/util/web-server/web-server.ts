import fastify, {
  FastifyBaseLogger,
  FastifyInstance,
  FastifyPluginAsync,
  FastifyPluginCallback,
  FastifyRegisterOptions,
  FastifyTypeProviderDefault,
  RawServerDefault,
  RouteHandlerMethod
} from 'fastify';
import { readdirSync } from 'fs';
import { Server } from 'http';
import { AddressInfo, Socket } from 'net';
import { resolve } from 'path';

import makeFlow from '@/main/adapters/flow-adapter';
import { Middleware } from '@/presentation/protocols';
import { SharedState } from '@/presentation/protocols/shared-state';
import { internalImplementationError, serverError } from '@/presentation/utils';
import {
  DICTIONARY,
  apmSpan,
  convertCamelCaseKeysToSnakeCase,
  convertSnakeCaseKeysToCamelCase,
  logger
} from '@/util';
import {
  SpanOptions,
  TraceLabels
} from '@/util/observability/apm/util/trace/types';

import { WebSocketServer, WebSocketServerOptions } from '../websocket-server';
import { Route } from './route';
import {
  Callback,
  Payload,
  REPLY_KEY,
  REQUEST_KEY,
  RouteMiddleware,
  Router,
  STATE_KEY
} from './types';
import { makeWebsocketServer } from '../websocket-server/factory';

export enum Exceptions {
  INVALID_PORT_VALUE = 'Port must be a number or a valid numerical string',
  REGISTER_ROUTE_AFTER_BOOTSTRAP_SERVER = 'Sorry, you cannot register routes after bootstraping the HTTP server'
}

type DecoratorOptions = {
  options: SpanOptions;
  params?: TraceLabels;
  result?: TraceLabels;
};

type Endpoint = {
  method: keyof Router;
  uri: string;
  handler: Function;
};

export class WebServer {
  private endpoints: Endpoint[] = [];
  private fastify!: FastifyInstance;

  private isLoadingRoutes = false;

  private listenerOptions!: { port: number; callback?: Callback };
  private baseUrl = '';
  private addressInfo!: AddressInfo | null | string;
  private startupCallbacks: Function[] = [];
  private isStarted = false;
  private static instance: WebServer;
  private socketIO!: WebSocketServer;

  private connections: Set<Socket> = new Set();

  constructor(private readonly _fastify: typeof fastify) {
    this.fastify = this._fastify();
    this.serverSetup(this.fastify);
    this.initializeStateInRequest();
  }

  private initializeStateInRequest() {
    this.fastify.decorateRequest(STATE_KEY);
  }

  private serverSetup(fastify: FastifyInstance) {
    fastify.server.on('connection', (socket) => {
      this.connections.add(socket);
      socket.on('close', () => this.connections.delete(socket));
    });

    fastify.addContentTypeParser(
      'application/json',
      { parseAs: 'string' },
      function (_req, body, done) {
        if (!body) return done(null, {});
        try {
          done(null, JSON.parse(String(body)));
        } catch (error) {
          done(error as Error, undefined);
        }
      }
    );

    fastify.addContentTypeParser(
      'application/x-www-form-urlencoded',
      { parseAs: 'string' },
      function (_req, body, done) {
        try {
          const parsed = Object.fromEntries(new URLSearchParams(String(body)));
          done(null, parsed);
        } catch (error) {
          done(error as Error, undefined);
        }
      }
    );
  }

  public getWebsocketServer = () => this.socketIO;

  public use<P extends Record<string, unknown>>(
    plugin:
      | FastifyPluginCallback<
          P,
          RawServerDefault,
          FastifyTypeProviderDefault,
          FastifyBaseLogger
        >
      | FastifyPluginAsync<
          P,
          RawServerDefault,
          FastifyTypeProviderDefault,
          FastifyBaseLogger
        >,
    options?: FastifyRegisterOptions<P>
  ): void {
    const internalOptions = <FastifyRegisterOptions<P>>(options ?? {});

    this.fastify.register(plugin, internalOptions);
  }

  public static getInstance(): WebServer {
    if (!WebServer.instance) {
      WebServer.instance = new WebServer(fastify);
    }

    return WebServer.instance;
  }

  public address() {
    return this?.addressInfo;
  }

  public socket(options: WebSocketServerOptions) {
    this.socketIO = makeWebsocketServer(this.fastify.server, options);
  }

  public router(params?: { path?: string; baseUrl?: string }) {
    if (this.isStarted)
      throw new Error(Exceptions.REGISTER_ROUTE_AFTER_BOOTSTRAP_SERVER);

    return new Route(
      this.fastify,
      this.adapterWithFlow.bind(this),
      this.adapterHookWithFlow.bind(this),
      this.saveEndpoint.bind(this),
      params?.baseUrl ?? this.baseUrl,
      params?.path ?? ''
    );
  }

  public async listen(port: number | string): Promise<RawServerDefault>;
  public listen(port: number | string, callback?: () => void): RawServerDefault;
  public listen(
    port: number | string,
    callback?: () => void
  ): RawServerDefault | Promise<RawServerDefault> {
    if (Number.isNaN(Number(port)))
      throw new Error(Exceptions.INVALID_PORT_VALUE);

    if (this.isStarted) return this.fastify.server;

    this.isStarted = true;

    this.listenerOptions = { callback, port: +port };

    setImmediate(() => this.serverBootstrap(+port, callback));

    this.addressInfo = this.fastify.server.address();

    return this.fastify.server;
  }

  public getServer(): Server {
    return this.fastify.server;
  }

  public ready(callback: () => void): void;
  public ready(): Promise<void>;
  public ready(callback?: () => void): void | Promise<void> {
    if (callback) {
      this.fastify.ready(() => callback());
      return;
    }

    return new Promise((resolve) => {
      this.fastify.ready(() => resolve());
    });
  }

  public async listenAsync(
    port: number | string,
    callback: () => void = () => {}
  ) {
    if (Number.isNaN(Number(port)))
      throw new Error(Exceptions.INVALID_PORT_VALUE);

    if (this.isStarted) return;

    this.isStarted = true;

    const promises = this.startupCallbacks.map(async (callback) =>
      callback?.()
    );

    await Promise.all(promises);

    this.listenerOptions = { callback, port: +port };

    setImmediate(() => this.serverBootstrap(+port, callback));

    this.addressInfo = this.fastify.server.address();

    return this.fastify.server;
  }

  private async serverBootstrap(port: number, callback?: Function) {
    const CHECK_INTERVAL = 100;
    let interval;

    await new Promise((resolve) => {
      interval = setInterval(() => {
        if (!this.isLoadingRoutes) {
          resolve(null);
        }
      }, CHECK_INTERVAL);
    });

    clearInterval(interval);

    this.socketIO?.bootstrap();

    this.fastify.ready(() => {
      callback?.();
      this.fastify.server.listen({
        port
      });
    });
  }

  public onStart(callback: Callback, ...callbacks: Callback[]): void;
  public onStart(callback: Callback): void;
  public onStart(callbacks: Callback[]): void;
  public onStart(
    callback: Callback[] | Callback,
    ...callbacks: Callback[]
  ): void {
    const callbackList = Array.isArray(callback)
      ? callback
      : [callback, ...callbacks];

    this.startupCallbacks = callbackList;
  }

  public async refresh() {
    if (!this.isStarted) return;

    this.fastify.server.close(() => {
      logger.log({ level: 'info', message: 'Refreshing server' });
    });

    this.refreshEndpoints();

    this.listen(this.listenerOptions.port, this.listenerOptions.callback);
  }

  public async close() {
    const END_TIMEOUT = 5_000;

    if (!this.isStarted) return;

    for (const socket of this.connections) {
      if (socket.readyState === 'open' || socket.readyState === 'readOnly') {
        socket.end();
        setTimeout(() => {
          if (!socket.destroyed) socket.destroy();
        }, END_TIMEOUT);
      }
    }

    await this.fastify.close();
    logger.log({ level: 'info', message: 'Shutting down server' });
  }

  public setBaseUrl(url: string) {
    if (this.isStarted) {
      logger.log({
        level: 'warn',
        message: 'Only set the default base url if the server is not started'
      });
      return;
    }
    this.baseUrl = url;
  }

  public async routesDirectory(
    path: string,
    route?: Route,
    ...middlewares: RouteMiddleware[] | Function[]
  ): Promise<void>;
  public async routesDirectory(
    path: string,
    baseUrl?: string,
    ...middlewares: RouteMiddleware[] | Function[]
  ): Promise<void>;
  public async routesDirectory(
    path: string,
    middleware?: RouteMiddleware | Function,
    ...middlewares: RouteMiddleware[] | Function[]
  ): Promise<void>;
  public async routesDirectory(
    path: string,
    arg1?: string | RouteMiddleware | Function | Route,
    ...args: RouteMiddleware[] | Function[]
  ): Promise<void> {
    const extensionsToSearch = ['.TS', '.JS'];
    const ignoreIfIncludes = ['.MAP.', '.SPEC.', '.TEST.'];

    const baseUrl = typeof arg1 === 'string' ? arg1 : this.baseUrl;

    const route =
      arg1 instanceof Route
        ? arg1
        : this.createRoute({
            baseUrl
          });

    const files = readdirSync(path);

    const middlewares =
      typeof arg1 !== 'string' && arg1 !== undefined && !(arg1 instanceof Route)
        ? [arg1, ...args]
        : args;

    if (middlewares.length) {
      route.use(...middlewares);
    }

    this.isLoadingRoutes = true;

    for await (const fileName of files) {
      const fileNameToUpperCase = fileName.toLocaleUpperCase();

      const hasAValidExtension = ignoreIfIncludes.map((text) =>
        fileNameToUpperCase.includes(text)
      );

      const haveAValidName = extensionsToSearch.map((ext) =>
        fileNameToUpperCase.endsWith(ext)
      );

      if (haveAValidName && hasAValidExtension) {
        const filePath = resolve(path, fileName);

        try {
          const setup = (await import(filePath)).default;

          if (typeof setup !== 'function') continue;

          setup(route);
        } catch (error) {
          logger.log(error);
          logger.log({
            level: 'error',
            message: `Attempted to load route file ${fileName}, but encountered an error. Verify that the file exists and is correctly formatted.`
          });
        }
      }
    }

    this.isLoadingRoutes = false;
  }

  private createRoute(params?: { path?: string; baseUrl?: string }): Route {
    return new Route(
      this.fastify,
      this.adapterWithFlow.bind(this),
      this.adapterHookWithFlow.bind(this),
      this.saveEndpoint.bind(this),
      params?.baseUrl ?? this.baseUrl,
      params?.path ?? ''
    );
  }

  private saveEndpoint(args: Endpoint): void {
    this.endpoints.push(args);
  }

  private refreshEndpoints(): void {
    for (const endpoint of this.endpoints) {
      if (endpoint.method === 'ws') continue;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.fastify[endpoint.method](endpoint.uri, <any>endpoint.handler);
    }
  }

  private makeSetStateInRequest(source: Record<string, unknown>) {
    return <T>(state: T) => {
      for (const key in state) {
        if (typeof key === 'string' || typeof key === 'number')
          source[key] = state[key];
      }
    };
  }

  private adaptMiddlewares(middlewares: RouteMiddleware[]) {
    return middlewares.map((middleware) => {
      return async (
        {
          [STATE_KEY]: state,
          [REPLY_KEY]: reply,
          [REQUEST_KEY]: request
        }: Payload,
        next: Middleware.Next
      ) => {
        const stateHook = <[SharedState, <T>(state: T) => void]>[
          state,
          this.makeSetStateInRequest(state)
        ];

        function handler() {
          const decoratorOptions: DecoratorOptions = {
            options: {
              name: '',
              subType: 'handler'
            },
            params: {}
          };

          if (typeof middleware === 'function') {
            decoratorOptions.options.name = middleware.name;
            decoratorOptions.params = { stateHook: 3 };
            const decorator = apmSpan(decoratorOptions);
            const proto = {};

            const methodName = middleware.name;

            const desc: PropertyDescriptor = {
              value: middleware.bind(null),
              writable: true,
              configurable: true,
              enumerable: false
            };

            const newDesc = decorator(proto, methodName, desc);

            return newDesc.value(request, reply, next, stateHook);
          }

          decoratorOptions.options.name = middleware.constructor.name;
          decoratorOptions.params = { stateHook: 1 };
          const decorator = apmSpan(decoratorOptions);

          const proto = middleware.constructor.prototype;
          const methodName = 'handle';
          const desc = Object.getOwnPropertyDescriptor(proto, methodName)!;

          const newDesc = decorator(proto, methodName, desc);

          const callback: Function = newDesc.value.bind(middleware);

          return callback(request, stateHook, next);
        }

        const response = await handler();

        if (!response) return;

        if (response?.headers) reply.headers(response.headers);

        if (!response.statusCode || !response.body)
          return reply
            .status(500)
            .send(
              internalImplementationError(
                DICTIONARY.RESPONSE.MESSAGE.INTERNAl.INCORRECT_CALLBACK_RETURN
              )
            );

        return reply
          .status(response.statusCode)
          .send(convertCamelCaseKeysToSnakeCase(response.body));
      };
    });
  }

  public adapter(middleware: RouteMiddleware) {
    return async (
      {
        [STATE_KEY]: state,
        [REPLY_KEY]: reply,
        [REQUEST_KEY]: request
      }: Payload,
      next: Middleware.Next
    ) => {
      const stateHook = <[SharedState, <T>(state: T) => void]>[
        state,
        this.makeSetStateInRequest(state)
      ];

      function handler() {
        const decoratorOptions: DecoratorOptions = {
          options: {
            name: '',
            subType: 'handler'
          },
          params: {}
        };

        if (typeof middleware === 'function') {
          decoratorOptions.options.name = middleware.name;
          decoratorOptions.params = { stateHook: 3 };
          const decorator = apmSpan(decoratorOptions);
          const proto = {};

          const methodName = middleware.name;

          const desc: PropertyDescriptor = {
            value: middleware.bind(null),
            writable: true,
            configurable: true,
            enumerable: false
          };

          const newDesc = decorator(proto, methodName, desc);

          return newDesc.value(request, reply, next, stateHook);
        }

        decoratorOptions.options.name = middleware.constructor.name;
        decoratorOptions.params = { stateHook: 1 };
        const decorator = apmSpan(decoratorOptions);

        const proto = middleware.constructor.prototype;
        const methodName = 'handle';
        const desc = Object.getOwnPropertyDescriptor(proto, methodName)!;

        const newDesc = decorator(proto, methodName, desc);

        const callback: Function = newDesc.value.bind(middleware);

        return callback(request, stateHook, next);
      }

      const response = await handler();

      if (!response) return;

      if (response?.headers) reply.headers(response.headers);

      if (!response.statusCode || !response.body)
        return reply
          .status(500)
          .send(
            internalImplementationError(
              DICTIONARY.RESPONSE.MESSAGE.INTERNAl.INCORRECT_CALLBACK_RETURN
            )
          );

      return reply
        .status(response.statusCode)
        .send(convertCamelCaseKeysToSnakeCase(response.body));
    };
  }

  private adapterHookWithFlow(
    middlewares: RouteMiddleware[]
  ): RouteHandlerMethod {
    return async (request, reply) => {
      try {
        if (!request[STATE_KEY]) {
          request[STATE_KEY] = {};
        }

        request.body = convertSnakeCaseKeysToCamelCase(request.body);
        request.params = convertSnakeCaseKeysToCamelCase(request.params);
        request.query = convertSnakeCaseKeysToCamelCase(request.query);

        await makeFlow({
          [REQUEST_KEY]: request,
          [STATE_KEY]: request[STATE_KEY],
          [REPLY_KEY]: reply
        })(...this.adaptMiddlewares(middlewares))();
      } catch (error) {
        reply.status(500).send(serverError(error));
      }
    };
  }

  private adapterWithFlow(middlewares: RouteMiddleware[]): RouteHandlerMethod {
    return async (request, reply) => {
      try {
        if (!request[STATE_KEY]) {
          request[STATE_KEY] = {};
        }

        request.body = convertSnakeCaseKeysToCamelCase(request.body);
        request.params = convertSnakeCaseKeysToCamelCase(request.params);
        request.query = convertSnakeCaseKeysToCamelCase(request.query);

        await makeFlow({
          [REQUEST_KEY]: request,
          [STATE_KEY]: request[STATE_KEY],
          [REPLY_KEY]: reply
        })(...this.adaptMiddlewares(middlewares))();

        if (reply.sent) return;

        reply.status(502).send({
          message: DICTIONARY.RESPONSE.MESSAGE.BAD_GATEWAY,
          payload: {},
          error: [{ message: 'Ocorreu um erro em nosso servidores' }]
        });
      } catch (error) {
        reply.status(500).send(serverError(error));
      }
    };
  }
}
