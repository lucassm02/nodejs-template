import { SharedState } from './shared-state';

export interface Job {
  handle(payload: Job.Payload, state: Job.State, next: Job.Next): Job.Result;
}

export namespace Job {
  type setState = (state: SharedState) => void;
  export type Payload = { body: any; headers: any };
  export type State = [SharedState, setState];
  export type Next = Function;
  export type Result = Promise<void>;
}
