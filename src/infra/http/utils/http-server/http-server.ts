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
import server, { Server } from 'http';
import { AddressInfo } from 'net';

import { RouteAlias } from './route-alias';
import { Callback, ExpressRoute, RouteMiddleware } from './types';

export class HttpServer {
  private express!: Express;
  private server!: Server;
  private listenerOptions!: { port: number; callback: Callback };
  private router!: Router;
  private defaultBaseUrl = '';
  private addressInfo!: AddressInfo | null | string;
  private routes: {
    baseUrl: string;
    route: Router;
  }[] = [];
  private httpParams: {
    route: string;
    request: Request | null;
    response: Response | null;
  }[] = [];

  private startupCallbacks: Function[] = [];

  private isStarted = false;

  private static instance: HttpServer;

  constructor() {
    this.express = express();
    this.router = Router();
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

    this.express.use(this.defaultBaseUrl, this.router);

    this.listenerOptions = { callback, port: +port };
    this.server = this.express.listen(port, callback);
    this.addressInfo = this.server.address();

    return this.server;
  }

  public getServer(): Server {
    this.express.use(this.defaultBaseUrl, this.router);
    return server.createServer(this.express);
  }

  public async listenAsync(
    port: number | string,
    callback: () => void = () => {}
  ) {
    if (this.isStarted) return;
    this.isStarted = true;

    this.express.use(this.defaultBaseUrl, this.router);

    const promises = this.startupCallbacks.map(async (callback) =>
      callback?.()
    );

    await Promise.all(promises);

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

  public baseUrl(url: string) {
    if (this.isStarted) {
      logger.log({
        level: 'warn',
        message: 'Only set the default base url if the server is not started',
      });

      return;
    }
    this.defaultBaseUrl = url;
  }

  public route(baseUrl = '') {
    const filteredParams = this.routes.filter(
      (index) => index.baseUrl !== baseUrl
    );

    const router = Router();
    this.express.use(baseUrl, router);
    this.routes = [...filteredParams, { baseUrl, route: router }];

    return router;
  }

  public getRoute(baseUrl: string) {
    const route = this?.routes?.find((route) => route.baseUrl === baseUrl);
    return route?.route ?? null;
  }

  public post(route: string, ...middlewares: RouteMiddleware[]) {
    this.router.post(route, ...this.adaptMiddlewares(middlewares));
    return new RouteAlias(
      this.router,
      'POST',
      this.adaptMiddlewares(middlewares)
    );
  }

  public get(route: string, ...middlewares: RouteMiddleware[]) {
    this.router.get(route, ...this.adaptMiddlewares(middlewares));
    return new RouteAlias(
      this.router,
      'GET',
      this.adaptMiddlewares(middlewares)
    );
  }

  public delete(route: string, ...middlewares: RouteMiddleware[]) {
    this.router.delete(route, ...this.adaptMiddlewares(middlewares));
    return new RouteAlias(
      this.router,
      'DELETE',
      this.adaptMiddlewares(middlewares)
    );
  }

  public put(route: string, ...middlewares: RouteMiddleware[]) {
    this.router.put(route, ...this.adaptMiddlewares(middlewares));
    return new RouteAlias(
      this.router,
      'PUT',
      this.adaptMiddlewares(middlewares)
    );
  }

  public options(route: string, ...middlewares: RouteMiddleware[]) {
    this.router.options(route, ...this.adaptMiddlewares(middlewares));
    return new RouteAlias(
      this.router,
      'OPTIONS',
      this.adaptMiddlewares(middlewares)
    );
  }

  public patch(route: string, ...middlewares: RouteMiddleware[]) {
    this.router.patch(route, ...this.adaptMiddlewares(middlewares));
    return new RouteAlias(
      this.router,
      'PATCH',
      this.adaptMiddlewares(middlewares)
    );
  }

  private setHttpParams(
    route: string,
    request: Request | null = null,
    response: Response | null = null
  ) {
    const filteredParams = this.httpParams.filter(
      (index) => index.route !== route
    );

    this.httpParams = [...filteredParams, { route, request, response }];
  }

  public getHttpParams(route: string) {
    return this.httpParams.find((index) => index.route === route);
  }

  private makeSetStateInRequest(request: Request) {
    return <T>(state: T) => {
      for (const key in state) {
        if (typeof key === 'string' || typeof key === 'number')
          request.sharedState[key] = state[key];
      }
    };
  }

  private makeSharedStateInitializer() {
    return (request: Request, response: Response, next: NextFunction) => {
      request.sharedState = {};
      next();
    };
  }

  private makeSharedStateChanger<T>(state: T) {
    return (request: Request, response: Response, next: NextFunction) => {
      response.locals.sharedSate = state;
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
          this.setHttpParams(request.url, request, response);
          const middlewareResponse = middleware(request, response, next, [
            request?.sharedState,
            this.makeSetStateInRequest(request),
          ]);
          this.setHttpParams(request.url, null, null);
          return middlewareResponse;
        };
      return this.middlewareAdapter(middleware);
    });
  }

  private middlewareAdapter(middleware: Middleware | Controller) {
    return async (request: Request, response: Response, next: NextFunction) => {
      this.setHttpParams(request.url, request, response);
      request.body = convertSnakeCaseKeysToCamelCase(request.body);
      request.params = convertSnakeCaseKeysToCamelCase(request.params);
      request.query = convertSnakeCaseKeysToCamelCase(request.query);

      const httpResponse = await middleware.handle(
        request,
        [request?.sharedState, this.makeSetStateInRequest(request)],
        next
      );

      if (!httpResponse) return;

      if (httpResponse?.headers) response.set(httpResponse.headers);

      this.setHttpParams(request.url, null, null);

      return response
        .status(httpResponse?.statusCode)
        .json(convertCamelCaseKeysToSnakeCase(httpResponse?.body));
    };
  }
}
