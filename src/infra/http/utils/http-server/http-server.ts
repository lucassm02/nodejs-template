import fastify, {
  FastifyInstance,
  FastifyPluginCallback,
  HookHandlerDoneFunction,
  RouteHandlerMethod
} from 'fastify';
import { readdirSync } from 'fs';
import { Server } from 'http';
import { AddressInfo } from 'net';
import { resolve } from 'path';

import makeFlow from '@/main/adapters/flow-adapter';
import { Middleware } from '@/presentation/protocols';
import { SharedState } from '@/presentation/protocols/shared-state';
import { internalImplementationError, serverError } from '@/presentation/utils';
import { DICTIONARY, convertCamelCaseKeysToSnakeCase, logger } from '@/util';

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

export enum Exceptions {
  INVALID_PORT_VALUE = 'Port must be a number or a valid numerical string',
  REGISTER_ROUTE_AFTER_BOOTSTRAP_SERVER = 'Sorry, you cannot register routes after bootstraping the HTTP server'
}

type Endpoint = {
  method: keyof Router;
  uri: string;
  handler: Function;
};

export class HttpServer {
  private endpoints: Endpoint[] = [];
  private fastify!: FastifyInstance;
  private listenerOptions!: { port: number; callback: Callback };
  private baseUrl = '';
  private addressInfo!: AddressInfo | null | string;
  private startupCallbacks: Function[] = [];
  private isStarted = false;
  private static instance: HttpServer;

  constructor(private readonly _fastify: typeof fastify) {
    this.fastify = this._fastify();
  }

  public use(
    plugin: FastifyPluginCallback,
    configs?: Record<string, unknown>
  ): void {
    this.fastify.register(plugin, configs);
  }

  public static getInstance(): HttpServer {
    if (!HttpServer.instance) {
      HttpServer.instance = new HttpServer(fastify);
    }

    return HttpServer.instance;
  }

  public address() {
    return this?.addressInfo;
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

  public listen(port: number | string, callback: () => void = () => {}) {
    if (Number.isNaN(Number(port)))
      throw new Error(Exceptions.INVALID_PORT_VALUE);

    if (this.isStarted) return;

    this.isStarted = true;

    this.listenerOptions = { callback, port: +port };

    this.fastify.ready(() => {
      callback();
      this.fastify.server.listen({
        port
      });
    });

    this.addressInfo = this.fastify.server.address();

    return this.fastify.server;
  }

  public getServer(): Server {
    return this.fastify.server;
  }

  public async ready() {
    await this.fastify.ready();
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

    this.fastify.ready(() => {
      callback();
      this.fastify.server.listen({
        port
      });
    });

    this.addressInfo = this.fastify.server.address();

    return this.fastify.server;
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

  public close() {
    if (!this.isStarted) return;

    this.fastify.server.close(() => {
      logger.log({ level: 'info', message: 'Shutting down server' });
    });
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
        const setup = (await import(filePath)).default;

        if (typeof setup !== 'function') continue;

        setup(route);
      }
    }
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
      this.fastify[endpoint.method](endpoint.uri, <any>endpoint.handler);
    }
  }

  private makeSetStateInRequest(_state: Record<string, unknown>) {
    return <T>(state: T) => {
      for (const key in state) {
        if (typeof key === 'string' || typeof key === 'number')
          _state[key] = state[key];
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

        const response = await (typeof middleware !== 'function'
          ? middleware.handle(request, stateHook, next)
          : middleware(request, reply, next, stateHook));

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

      const response = await (typeof middleware !== 'function'
        ? middleware.handle(request, stateHook, next)
        : middleware(request, reply, next, stateHook));

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
        await makeFlow({
          [REQUEST_KEY]: request,
          [STATE_KEY]: {},
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
        await makeFlow({
          [REQUEST_KEY]: request,
          [STATE_KEY]: {},
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
