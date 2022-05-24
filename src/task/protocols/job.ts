import { SharedState } from './shared-state';

export interface Job {
  handle(state: Job.State, next: Job.Next): Job.Result;
}

export namespace Job {
  type setState = (state: SharedState) => void;
  export type State = [SharedState, setState];
  export type Next = Function;
  export type Result = Promise<void>;
}
