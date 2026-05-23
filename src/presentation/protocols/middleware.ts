import { RequestGenericInterface } from 'fastify';

import {
  DefaultRequestGeneric,
  HttpResponse,
  HttpRequest as Request
} from './http';
import { SharedState } from './shared-state';

export interface Middleware<
  T extends RequestGenericInterface = DefaultRequestGeneric
> {
  handle(
    httpRequest: Middleware.HttpRequest<T>,
    state: Middleware.State,
    next: Middleware.Next
  ): Middleware.Result;
}

export namespace Middleware {
  type SetState = <T = SharedState>(state: T) => void;
  export type State = [SharedState, SetState];
  export type HttpRequest<
    T extends RequestGenericInterface = DefaultRequestGeneric
  > = Request<T>;
  export type Next = Function;
  export type Result = Promise<HttpResponse>;
}
