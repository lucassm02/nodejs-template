import { Job } from '@/consumer/protocols';

import makeFlow from './fow-adapter';

const STATE_KEY = Symbol('STATE');

export const consumerAdapter = (...jobs: Job[]) => {
  type State = { [key: string]: any };

  const adaptedJobs = jobs.map((job) => {
    return (
      payload: Job.Payload & { [key: string | symbol]: any },
      next: Job.Next
    ) => {
      const setState = (data: State) => {
        for (const key in data) {
          if (typeof key === 'string' || typeof key === 'number')
            payload[STATE_KEY][key] = data[key];
        }
      };

      const stateHook = <[any, any]>[payload[STATE_KEY], setState];

      return job.handle(payload, stateHook, next);
    };
  });

  return (payload: object) => {
    return makeFlow({ ...payload, [STATE_KEY]: {} })(...adaptedJobs)();
  };
};
