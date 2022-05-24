import { HttpRequest as Request, HttpResponse } from './http';
import { SharedState } from './shared-state';

export interface Middleware {
  handle: (
    httpRequest: Middleware.HttpRequest,
    state: Middleware.State,
    next: Middleware.Next
  ) => Middleware.Result;
}

export namespace Middleware {
  type SetState = <T = SharedState>(state: T) => void;
  export type State = [SharedState, SetState];
  export type HttpRequest = Request;
  export type Next = Function;
  export type Result = Promise<HttpResponse>;
}
