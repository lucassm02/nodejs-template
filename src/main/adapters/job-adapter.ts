import { Job } from '@/job/protocols';
import { apmSpan } from '@/util';
import {
  SpanOptions,
  TraceLabels
} from '@/util/observability/apm/util/trace/types';

import makeFlow from './flow-adapter';

const STATE_KEY = Symbol('STATE');

type DecoratorOptions = {
  options: SpanOptions;
  params?: TraceLabels;
  result?: TraceLabels;
};

type State = Record<string, unknown>;
type Payload = Job.Payload & { [key: string | symbol]: State };

export const jobAdapter = (...jobs: (Job | Function)[]) => {
  const adaptedJobs = jobs.map((job) => {
    const decoratorOptions: DecoratorOptions = {
      options: {
        name: typeof job === 'function' ? job.name : job.constructor.name,
        subType: 'handler'
      },
      params: { payload: 0, stateHook: 1 }
    };

    let decoratedHandler: Function;

    if (typeof job === 'function') {
      const decorator = apmSpan(decoratorOptions);
      const desc: PropertyDescriptor = {
        value: job.bind(null),
        writable: true,
        configurable: true,
        enumerable: false
      };
      decoratedHandler = decorator({}, job.name, desc).value;
    } else {
      const decorator = apmSpan(decoratorOptions);
      const proto = job.constructor.prototype;
      const desc = Object.getOwnPropertyDescriptor(proto, 'handle')!;
      decoratedHandler = decorator(proto, 'handle', desc).value.bind(job);
    }

    return ({ [STATE_KEY]: state, ...payload }: Payload, next: Job.Next) => {
      const setState = (data: State) => {
        for (const key in data) {
          if (typeof key === 'string' || typeof key === 'number')
            state[key] = data[key];
        }
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const stateHook = <[any, any]>[state, setState];

      return decoratedHandler(payload, stateHook, next);
    };
  });

  return async (payload: Record<string, unknown>): Promise<void> => {
    await makeFlow({
      ...payload,
      [STATE_KEY]: {}
    })(...adaptedJobs)();
  };
};
