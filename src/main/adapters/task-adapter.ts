import { Job } from '@/task/protocols';

import makeFlow from './fow-adapter';

export const taskAdapter = (...jobs: Job[]) => {
  type State = { [key: string]: any };

  const state = {} as State;

  const setState = (data: State) => {
    for (const key in data) {
      if (typeof key === 'string' || typeof key === 'number')
        state[key] = data[key];
    }
  };

  const adaptedJobs = jobs.map((job) => {
    return (next: Job.Next) => {
      return job.handle([state, setState], next);
    };
  });

  return () => {
    return makeFlow({})(...adaptedJobs)();
  };
};
