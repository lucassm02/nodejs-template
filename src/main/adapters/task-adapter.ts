import { Task } from '@/schedule/protocols';

import makeFlow from './fow-adapter';

const STATE_KEY = Symbol('STATE');

export const taskAdapter = (...tasks: (Task | Function)[]) => {
  type State = Record<string, unknown>;

  const adaptedTasks = tasks.map((task) => {
    return (
      { [STATE_KEY]: state }: { [key: string | symbol]: State },
      next: Task.Next
    ) => {
      const setState = (data: State) => {
        for (const key in data) {
          if (typeof key === 'string' || typeof key === 'number')
            state[key] = data[key];
        }
      };

      const stateHook = <[any, any]>[state, setState];

      if (typeof task === 'function') return task(stateHook, next);

      return task.handle(stateHook, next);
    };
  });

  return () => {
    return makeFlow({ [STATE_KEY]: {} })(...adaptedTasks)();
  };
};
