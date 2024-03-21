import { FastifyInstance } from 'fastify';

import { RouteMiddleware } from './types';

export class Route {
  constructor(
    private readonly router: FastifyInstance,
    private readonly middlewareAdapter: Function,
    private readonly basePath: string
  ) {}

  private getFullPathRoute(path: string): string {
    return this.basePath + path;
  }

  public post(route: string, ...middlewares: RouteMiddleware[]) {
    this.router.post(
      this.getFullPathRoute(route),
      this.middlewareAdapter(middlewares)
    );
  }

  public get(route: string, ...middlewares: RouteMiddleware[]) {
    this.router.get(
      this.getFullPathRoute(route),
      this.middlewareAdapter(middlewares)
    );
  }

  public delete(route: string, ...middlewares: RouteMiddleware[]) {
    this.router.delete(
      this.getFullPathRoute(route),
      this.middlewareAdapter(middlewares)
    );
  }

  public put(route: string, ...middlewares: RouteMiddleware[]) {
    this.router.put(
      this.getFullPathRoute(route),
      this.middlewareAdapter(middlewares)
    );
  }

  public options(route: string, ...middlewares: RouteMiddleware[]) {
    this.router.options(
      this.getFullPathRoute(route),
      this.middlewareAdapter(middlewares)
    );
  }

  public patch(route: string, ...middlewares: RouteMiddleware[]) {
    this.router.patch(
      this.getFullPathRoute(route),
      this.middlewareAdapter(middlewares)
    );
  }
}
