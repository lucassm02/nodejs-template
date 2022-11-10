import { SharedState } from './shared-state';

export interface Job {
  handle(payload: Job.Payload, state: Job.State, next: Job.Next): Job.Result;
}

export namespace Job {
  type SetState = <T = SharedState>(state: T) => void;
  type Properties = {
    queue: string;
    exchange: string;
    routingKey: string;
  };

  export type Payload<B = object, H = object> = {
    body: B;
    headers: H;
    properties: Properties;
  };
  export type State = [SharedState, SetState];
  export type Next = Function;
  export type Result = Promise<void>;
}
