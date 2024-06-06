import { FastifyInstance, type FastifySchema } from 'fastify';

import { Middleware } from '@/presentation/protocols';

import type {
  RouteMiddleware,
  ValidationSchema,
  AllowedMethods,
  RouteMethodsArguments
} from './types';

export class Route {
  private callbacks: Function[] = [];
  constructor(
    private readonly fastify: FastifyInstance,
    private readonly adapter: Function,
    private readonly adapterHook: Function,
    private readonly save: Function,
    private readonly basePath: string,
    private readonly path: string
  ) {
    this.fastify.register(
      (instance, _options, done) => {
        for (const callback of this.callbacks) {
          callback(instance);
        }
        done();
      },
      {
        prefix: this.basePath
      }
    );
  }

  private getFullPathRoute(endpoint: string): string {
    return this.path + endpoint;
  }

  private addRoute(...args: [AllowedMethods, ...RouteMethodsArguments]): void {
    const [method, route, schemaOrMiddleware] = args;

    const schema =
      args[2] instanceof Function || (<Middleware>args[2])?.handle !== undefined
        ? null
        : schemaOrMiddleware;

    const middlewares = schema ? args.slice(3) : args.slice(2);

    const callback = (instance: FastifyInstance) => {
      const uri = this.getFullPathRoute(route);
      const handler = this.adapter(middlewares);

      this.save({
        method,
        uri,
        handler
      });

      if (schema) {
        instance[method](uri, { schema: <FastifySchema>schema }, handler);
        return;
      }

      instance[method](uri, handler);
    };
    this.callbacks.push(callback);
  }

  public post(
    route: string,
    schema: ValidationSchema,
    ...middlewares: RouteMiddleware[]
  ): void;
  public post(route: string, ...middlewares: RouteMiddleware[]): void;
  public post(...args: RouteMethodsArguments): void {
    const postMethodArgument: [AllowedMethods, ...RouteMethodsArguments] = [
      'post',
      ...args
    ];
    this.addRoute(...postMethodArgument);
  }

  public use(...middlewares: RouteMiddleware[]) {
    const callback = (instance: FastifyInstance) => {
      instance.addHook('onRequest', this.adapterHook(middlewares));
    };
    this.callbacks.push(callback);
  }

  public get(
    route: string,
    schema: ValidationSchema,
    ...middlewares: RouteMiddleware[]
  ): void;
  public get(route: string, ...middlewares: RouteMiddleware[]): void;
  public get(...args: RouteMethodsArguments): void {
    const getMethodArgument: [AllowedMethods, ...RouteMethodsArguments] = [
      'get',
      ...args
    ];
    this.addRoute(...getMethodArgument);
  }

  public delete(
    route: string,
    schema: ValidationSchema,
    ...middlewares: RouteMiddleware[]
  ): void;
  public delete(route: string, ...middlewares: RouteMiddleware[]): void;
  public delete(...args: RouteMethodsArguments): void {
    const deleteMethodArgument: [AllowedMethods, ...RouteMethodsArguments] = [
      'delete',
      ...args
    ];
    this.addRoute(...deleteMethodArgument);
  }

  public put(
    route: string,
    schema: ValidationSchema,
    ...middlewares: RouteMiddleware[]
  ): void;
  public put(route: string, ...middlewares: RouteMiddleware[]): void;
  public put(...args: RouteMethodsArguments): void {
    const putMethodArgument: [AllowedMethods, ...RouteMethodsArguments] = [
      'put',
      ...args
    ];
    this.addRoute(...putMethodArgument);
  }

  public options(
    route: string,
    schema: ValidationSchema,
    ...middlewares: RouteMiddleware[]
  ): void;
  public options(route: string, ...middlewares: RouteMiddleware[]): void;
  public options(...args: RouteMethodsArguments): void {
    const optionsMethodArgument: [AllowedMethods, ...RouteMethodsArguments] = [
      'options',
      ...args
    ];
    this.addRoute(...optionsMethodArgument);
  }

  public patch(
    route: string,
    schema: ValidationSchema,
    ...middlewares: RouteMiddleware[]
  ): void;
  public patch(route: string, ...middlewares: RouteMiddleware[]): void;
  public patch(...args: RouteMethodsArguments): void {
    const patchMethodArgument: [AllowedMethods, ...RouteMethodsArguments] = [
      'patch',
      ...args
    ];
    this.addRoute(...patchMethodArgument);
  }
}
