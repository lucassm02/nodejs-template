import { RouteMiddleware, Router } from './types';

export class Route {
  constructor(
    private readonly router: Router,
    private readonly adapter: Function,
    private readonly save: Function,
    private readonly basePath: string
  ) {}

  private getFullPathRoute(path: string): string {
    return this.basePath + path;
  }

  public post(route: string, ...middlewares: RouteMiddleware[]) {
    const uri = this.getFullPathRoute(route);
    const handler = this.adapter(middlewares);
    this.save({
      method: 'post',
      uri,
      handler
    });
    this.router.post(uri, handler);
  }

  public get(route: string, ...middlewares: RouteMiddleware[]) {
    const uri = this.getFullPathRoute(route);
    const handler = this.adapter(middlewares);
    this.save({
      method: 'get',
      uri,
      handler
    });
    this.router.get(uri, handler);
  }

  public delete(route: string, ...middlewares: RouteMiddleware[]) {
    const uri = this.getFullPathRoute(route);
    const handler = this.adapter(middlewares);
    this.save({
      method: 'delete',
      uri,
      handler
    });
    this.router.delete(uri, handler);
  }

  public put(route: string, ...middlewares: RouteMiddleware[]) {
    const uri = this.getFullPathRoute(route);
    const handler = this.adapter(middlewares);
    this.save({
      method: 'put',
      uri,
      handler
    });
    this.router.put(uri, handler);
  }

  public options(route: string, ...middlewares: RouteMiddleware[]) {
    const uri = this.getFullPathRoute(route);
    const handler = this.adapter(middlewares);
    this.save({
      method: 'options',
      uri,
      handler
    });
    this.router.options(uri, handler);
  }

  public patch(route: string, ...middlewares: RouteMiddleware[]) {
    const uri = this.getFullPathRoute(route);
    const handler = this.adapter(middlewares);
    this.save({
      method: 'patch',
      uri,
      handler
    });
    this.router.patch(uri, handler);
  }
}
