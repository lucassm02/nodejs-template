import { Job } from '@/consumer/protocols';

import makeFlow from './fow-adapter';

export const consumerAdapter = (...jobs: Job[]) => {
  type State = { [key: string]: any };

  const state = {} as State;

  const setState = (data: State) => {
    for (const key in data) {
      if (typeof key === 'string' || typeof key === 'number')
        state[key] = data[key];
    }
  };

  const adaptedJobs = jobs.map((job) => {
    return (payload: Job.Payload, next: Job.Next) => {
      return job.handle(payload, [state, setState], next);
    };
  });

  return (payload: object) => {
    return makeFlow(payload)(...adaptedJobs)();
  };
};
