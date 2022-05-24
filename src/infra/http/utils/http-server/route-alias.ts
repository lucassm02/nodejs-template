import { Router } from 'express';

import { DefaultExpressCallback } from './types';

type RouteMethods = 'GET' | 'PUT' | 'POST' | 'DELETE' | 'OPTIONS' | 'PATCH';

export class RouteAlias {
  constructor(
    private readonly router: Router,
    private readonly method: RouteMethods,
    private readonly middlewares: DefaultExpressCallback[]
  ) {}
  public alias(alias: string) {
    const methodToLowerCase = String(this.method).toLowerCase();
    const router = this.router as any;
    const method = router?.[methodToLowerCase];
    method.call(this.router, ...[alias, ...this.middlewares]);

    return this;
  }
}
