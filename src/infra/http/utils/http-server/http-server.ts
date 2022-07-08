import { Controller, Middleware } from '@/presentation/protocols';
import {
  convertCamelCaseKeysToSnakeCase,
  convertSnakeCaseKeysToCamelCase,
  logger,
} from '@/util';
import express, {
  Express,
  NextFunction,
  Request,
  Response,
  Router,
} from 'express';
import { readdirSync } from 'fs';
import server, { Server } from 'http';
import { AddressInfo } from 'net';
import { resolve } from 'path';

import { Route } from './route';
import { Callback, ExpressRoute, RouteMiddleware } from './types';

const SHARED_STATE_SYMBOL = Symbol('SharedState');

export class HttpServer {
  private express!: Express;
  private server!: Server;
  private listenerOptions!: { port: number; callback: Callback };
  private baseUrl = '';
  private addressInfo!: AddressInfo | null | string;
  private routers: {
    path?: string;
    baseUrl?: string;
    router: Router;
    loaded: boolean;
  }[] = [];

  private startupCallbacks: Function[] = [];

  private isStarted = false;

  private static instance: HttpServer;

  constructor() {
    this.express = express();
    this.express.use(this.makeSharedStateInitializer());
  }

  public static getInstance(): HttpServer {
    if (!HttpServer.instance) {
      HttpServer.instance = new HttpServer();
    }

    return HttpServer.instance;
  }

  public address() {
    return this?.addressInfo;
  }

  public listen(port: number | string, callback: () => void = () => {}) {
    if (this.isStarted) return;
    this.isStarted = true;

    this.loadRoutes();

    this.listenerOptions = { callback, port: +port };
    this.server = this.express.listen(port, callback);
    this.addressInfo = this.server.address();

    return this.server;
  }

  public getServer(): Server {
    this.loadRoutes();
    return server.createServer(this.express);
  }

  public async listenAsync(
    port: number | string,
    callback: () => void = () => {}
  ) {
    if (this.isStarted) return;
    this.isStarted = true;

    const promises = this.startupCallbacks.map(async (callback) =>
      callback?.()
    );

    await Promise.all(promises);

    this.loadRoutes();

    this.listenerOptions = { callback, port: +port };
    this.server = this.express.listen(port, callback);
    this.addressInfo = this.server.address();

    return this.server;
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

  public refresh() {
    if (!this.isStarted) return;
    this.server.close(() => {
      logger.log({ level: 'info', message: 'Refreshing server' });
    });

    this.listen(this.listenerOptions.port, this.listenerOptions.callback);
  }

  public close() {
    if (!this.isStarted) return;
    this.server.close(() => {
      logger.log({ level: 'info', message: 'Shutting down server' });
    });
  }

  public use(
    value: string | RouteMiddleware | ExpressRoute | Function,
    ...middlewares: RouteMiddleware[] | ExpressRoute[]
  ) {
    if (typeof value === 'string') {
      this.express.use(value, ...this.adaptMiddlewares(middlewares));
      return;
    }

    this.express.use(...this.adaptMiddlewares([value, ...middlewares]));
  }

  public setSharedState<T>(state: T): void {
    this.express.use(this.makeSharedStateChanger(state));
  }

  public set(setting: string, val: any) {
    this.express.set(setting, val);
  }

  public setBaseUrl(url: string) {
    if (this.isStarted) {
      logger.log({
        level: 'warn',
        message: 'Only set the default base url if the server is not started',
      });

      return;
    }
    this.baseUrl = url;
  }

  public async routesDirectory(
    path: string,
    route?: Route,
    ...middlewares: RouteMiddleware[] | ExpressRoute[] | Function[]
  ): Promise<void>;
  public async routesDirectory(
    path: string,
    baseUrl?: string,
    ...middlewares: RouteMiddleware[] | ExpressRoute[] | Function[]
  ): Promise<void>;
  public async routesDirectory(
    path: string,
    middleware?: RouteMiddleware | ExpressRoute | Function,
    ...middlewares: RouteMiddleware[] | ExpressRoute[] | Function[]
  ): Promise<void>;
  public async routesDirectory(
    path: string,
    arg1?: string | RouteMiddleware | ExpressRoute | Function | Route,
    ...args: RouteMiddleware[] | ExpressRoute[] | Function[]
  ): Promise<void> {
    const extensionsToSearch = ['.TS', '.JS'];
    const ignoreIfIncludes = ['.MAP.', '.SPEC.', '.TEST.'];

    const baseUrl = typeof arg1 === 'string' ? arg1 : this.baseUrl;
    const middlewares = typeof arg1 === 'function' ? [arg1, ...args] : args;

    const files = readdirSync(path);

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
        const setup = <Function>(await import(filePath)).default;

        if (!setup) continue;

        const route = arg1 instanceof Route ? arg1 : this.route('', baseUrl);

        if (middlewares.length) {
          const [arg1, ...args] = middlewares;
          route.use(arg1, ...args);
        }

        setup(route);
      }
    }

    this.loadRoutes();
  }

  public route(path?: string, baseUrl?: string) {
    const route = this.getRoute(path, baseUrl);

    if (route) return route;

    const router = Router();
    this.routers = [...this.routers, { path, baseUrl, router, loaded: false }];

    return new Route(router, this.adaptMiddlewares.bind(this));
  }

  public getRoute(path?: string, baseUrl?: string) {
    const route = this.routers.find(
      (route) => route.path === path && route.baseUrl === baseUrl
    );

    if (!route) return undefined;

    return new Route(route.router, this.adaptMiddlewares.bind(this));
  }

  private loadRoutes() {
    this.routers
      .filter((router) => !router.loaded)
      .forEach((router) => {
        const baseUrl = router.baseUrl ?? this.baseUrl;
        const url = `${baseUrl}/${router.path}`.replaceAll(/\/{2,}/g, '/');
        this.express.use(url, router.router);
        router.loaded = true;
      });
  }

  private makeSetStateInRequest(request: Request) {
    return <T>(state: T) => {
      for (const key in state) {
        if (typeof key === 'string' || typeof key === 'number')
          request[SHARED_STATE_SYMBOL][key] = state[key];
      }
    };
  }

  private makeSharedStateInitializer() {
    return (request: Request, response: Response, next: NextFunction) => {
      request[SHARED_STATE_SYMBOL] = {};
      next();
    };
  }

  private makeSharedStateChanger<T>(state: T) {
    return (request: Request, _: Response, next: NextFunction) => {
      request[SHARED_STATE_SYMBOL] = state;
      next();
    };
  }

  public adapter(middleware: Middleware | Controller) {
    return this.middlewareAdapter(middleware);
  }

  private adaptMiddlewares(middlewares: RouteMiddleware[]) {
    return middlewares.map((middleware) => {
      if (typeof middleware === 'function')
        return (request: Request, response: Response, next: NextFunction) => {
          const middlewareResponse = middleware(request, response, next, [
            request[SHARED_STATE_SYMBOL],
            this.makeSetStateInRequest(request),
          ]);

          return middlewareResponse;
        };
      return this.middlewareAdapter(middleware);
    });
  }

  private middlewareAdapter(middleware: Middleware | Controller) {
    return async (request: Request, response: Response, next: NextFunction) => {
      request.body = convertSnakeCaseKeysToCamelCase(request.body);
      request.params = convertSnakeCaseKeysToCamelCase(request.params);
      request.query = convertSnakeCaseKeysToCamelCase(request.query);

      const httpResponse = await middleware.handle(
        request,
        [request[SHARED_STATE_SYMBOL], this.makeSetStateInRequest(request)],
        next
      );

      if (!httpResponse) return;

      if (httpResponse?.headers) response.set(httpResponse.headers);

      return response
        .status(httpResponse?.statusCode)
        .json(convertCamelCaseKeysToSnakeCase(httpResponse?.body));
    };
  }
}
