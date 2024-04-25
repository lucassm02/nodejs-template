import { Job } from '@/job/protocols';

import makeFlow from './flow-adapter';

const STATE_KEY = Symbol('STATE');

type State = Record<string, unknown>;
type Payload = Job.Payload & { [key: string | symbol]: State };

export const jobAdapter = (...jobs: (Job | Function)[]) => {
  const adaptedJobs = jobs.map((job) => {
    return ({ [STATE_KEY]: state, ...payload }: Payload, next: Job.Next) => {
      const setState = (data: State) => {
        for (const key in data) {
          if (typeof key === 'string' || typeof key === 'number')
            state[key] = data[key];
        }
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const stateHook = <[any, any]>[state, setState];

      if (typeof job === 'function') return job(payload, stateHook, next);

      return job.handle(payload, stateHook, next);
    };
  });

  return async (payload: Record<string, unknown>): Promise<void> => {
    await makeFlow({
      ...payload,
      [STATE_KEY]: {}
    })(...adaptedJobs)();
  };
};
