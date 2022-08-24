import { Task } from '@/schedule/protocols';

import makeFlow from './fow-adapter';

export const taskAdapter = (...tasks: Task[]) => {
  type State = { [key: string]: any };

  const state: State = {};

  const setState = (data: State) => {
    for (const key in data) {
      if (typeof key === 'string' || typeof key === 'number')
        state[key] = data[key];
    }
  };

  const adaptedTasks = tasks.map((task) => {
    return (_: unknown, next: Task.Next) => {
      return task.handle([state, setState], next);
    };
  });

  return () => {
    return makeFlow({})(...adaptedTasks)();
  };
};
