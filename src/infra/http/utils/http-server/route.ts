import { Router } from 'express';

import { RouteAlias } from './route-alias';
import { ExpressRoute, RouteMiddleware } from './types';

export class Route {
  constructor(
    private readonly router: Router,
    private readonly middlewareAdapter: Function
  ) {}

  public use(
    value: string | RouteMiddleware | ExpressRoute | Function,
    ...middlewares: RouteMiddleware[] | ExpressRoute[]
  ) {
    if (typeof value === 'string') {
      this.router.use(value, ...this.middlewareAdapter(middlewares));
      return;
    }

    this.router.use(...this.middlewareAdapter([value, ...middlewares]));
  }

  public post(route: string, ...middlewares: RouteMiddleware[]) {
    this.router.post(route, ...this.middlewareAdapter(middlewares));
    return new RouteAlias(
      this.router,
      'POST',
      this.middlewareAdapter(middlewares)
    );
  }

  public get(route: string, ...middlewares: RouteMiddleware[]) {
    this.router.get(route, ...this.middlewareAdapter(middlewares));
    return new RouteAlias(
      this.router,
      'GET',
      this.middlewareAdapter(middlewares)
    );
  }

  public delete(route: string, ...middlewares: RouteMiddleware[]) {
    this.router.delete(route, ...this.middlewareAdapter(middlewares));
    return new RouteAlias(
      this.router,
      'DELETE',
      this.middlewareAdapter(middlewares)
    );
  }

  public put(route: string, ...middlewares: RouteMiddleware[]) {
    this.router.put(route, ...this.middlewareAdapter(middlewares));
    return new RouteAlias(
      this.router,
      'PUT',
      this.middlewareAdapter(middlewares)
    );
  }

  public options(route: string, ...middlewares: RouteMiddleware[]) {
    this.router.options(route, ...this.middlewareAdapter(middlewares));
    return new RouteAlias(
      this.router,
      'OPTIONS',
      this.middlewareAdapter(middlewares)
    );
  }

  public patch(route: string, ...middlewares: RouteMiddleware[]) {
    this.router.patch(route, ...this.middlewareAdapter(middlewares));
    return new RouteAlias(
      this.router,
      'PATCH',
      this.middlewareAdapter(middlewares)
    );
  }
}
