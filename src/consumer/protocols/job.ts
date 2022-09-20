import { SharedState } from './shared-state';

export interface Job {
  handle(payload: Job.Payload, state: Job.State, next: Job.Next): Job.Result;
}

export namespace Job {
  type SetState = <T = SharedState>(state: T) => void;
  export type Payload<B = any, H = any> = { body: B; headers: H };
  export type State = [SharedState, SetState];
  export type Next = Function;
  export type Result = Promise<void>;
}
