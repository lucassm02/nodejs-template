import { SharedState } from './shared-state';

export interface Job {
  handle(payload: Job.Payload, state: Job.State, next: Job.Next): Job.Result;
}

export namespace Job {
  type SetState = <T = SharedState>(state: T) => void;
  type Fields = {
    queue: string;
    exchange: string;
    routingKey: string;
  };
  type Properties = Record<string, unknown>;

  export type Payload<
    B extends Object = Record<string, unknown>,
    H extends Object = Record<string, unknown>
  > = {
    body: B;
    headers: H;
    field: Fields;
    properties: Properties;
    reject: (requeue?: boolean) => void;
  };
  export type State = [SharedState, SetState];
  export type Next = Function;
  export type Result = Promise<void>;
}
