import { HttpRequest as Request, HttpResponse } from './http';
import { SharedState } from './shared-state';

export interface Controller {
  handle(
    httpRequest: Controller.HttpRequest,
    state: Controller.State
  ): Controller.Result;
}

export namespace Controller {
  type SetState = <T = SharedState>(state: T) => void;
  export type State = [SharedState, SetState];
  export type HttpRequest = Request;
  export type Result = Promise<HttpResponse>;
}
