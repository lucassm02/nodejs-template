import { FastifyInstance } from 'fastify';

import { RouteMiddleware } from './types';

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

  public post(route: string, ...middlewares: RouteMiddleware[]) {
    const callback = (instance: FastifyInstance) => {
      const uri = this.getFullPathRoute(route);
      const handler = this.adapter(middlewares);

      this.save({
        method: 'post',
        uri,
        handler
      });

      instance.post(uri, handler);
    };
    this.callbacks.push(callback);
  }

  public use(...middlewares: RouteMiddleware[]) {
    const callback = (instance: FastifyInstance) => {
      instance.addHook('onRequest', this.adapterHook(middlewares));
    };
    this.callbacks.push(callback);
  }

  public get(route: string, ...middlewares: RouteMiddleware[]) {
    const callback = (instance: FastifyInstance) => {
      const uri = this.getFullPathRoute(route);
      const handler = this.adapter(middlewares);

      this.save({
        method: 'get',
        uri,
        handler
      });

      instance.get(uri, handler);
    };

    this.callbacks.push(callback);
  }

  public delete(route: string, ...middlewares: RouteMiddleware[]) {
    const callback = (instance: FastifyInstance) => {
      const uri = this.getFullPathRoute(route);
      const handler = this.adapter(middlewares);
      this.save({
        method: 'delete',
        uri,
        handler
      });
      instance.delete(uri, handler);
    };
    this.callbacks.push(callback);
  }

  public put(route: string, ...middlewares: RouteMiddleware[]) {
    const callback = (instance: FastifyInstance) => {
      const uri = this.getFullPathRoute(route);
      const handler = this.adapter(middlewares);
      this.save({
        method: 'put',
        uri,
        handler
      });
      instance.put(uri, handler);
    };
    this.callbacks.push(callback);
  }

  public options(route: string, ...middlewares: RouteMiddleware[]) {
    const callback = (instance: FastifyInstance) => {
      const uri = this.getFullPathRoute(route);
      const handler = this.adapter(middlewares);
      this.save({
        method: 'options',
        uri,
        handler
      });
      instance.options(uri, handler);
    };
    this.callbacks.push(callback);
  }

  public patch(route: string, ...middlewares: RouteMiddleware[]) {
    const callback = (instance: FastifyInstance) => {
      const uri = this.getFullPathRoute(route);
      const handler = this.adapter(middlewares);
      this.save({
        method: 'patch',
        uri,
        handler
      });
      instance.patch(uri, handler);
    };
    this.callbacks.push(callback);
  }
}
