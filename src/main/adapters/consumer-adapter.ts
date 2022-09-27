import { Job } from '@/consumer/protocols';

import makeFlow from './fow-adapter';

const STATE_KEY = Symbol('STATE');

export const consumerAdapter = (...jobs: Job[] | Function[]) => {
  type State = { [key: string]: any };

  const adaptedJobs = jobs.map((job) => {
    return (
      {
        [STATE_KEY]: state,
        ...payload
      }: Job.Payload & { [key: string | symbol]: any },
      next: Job.Next
    ) => {
      const setState = (data: State) => {
        for (const key in data) {
          if (typeof key === 'string' || typeof key === 'number')
            state[key] = data[key];
        }
      };

      const stateHook = <[any, any]>[state, setState];

      if (typeof job === 'function') return job(payload, stateHook, next);

      return job.handle(payload, stateHook, next);
    };
  });

  return (payload: object) => {
    return makeFlow({ ...payload, [STATE_KEY]: {} })(...adaptedJobs)();
  };
};
