import { RequestGenericInterface } from 'fastify';

import {
  DefaultRequestGeneric,
  HttpResponse,
  HttpRequest as Request
} from './http';
import { SharedState } from './shared-state';

export interface Controller<
  T extends RequestGenericInterface = DefaultRequestGeneric
> {
  handle(
    httpRequest: Controller.HttpRequest<T>,
    state: Controller.State
  ): Controller.Result;
}

export namespace Controller {
  type SetState = <T = SharedState>(state: T) => void;
  export type State = [SharedState, SetState];
  export type HttpRequest<
    T extends RequestGenericInterface = DefaultRequestGeneric
  > = Request<T>;
  export type Result = Promise<HttpResponse>;
}
