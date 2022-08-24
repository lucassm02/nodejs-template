import { ExampleTask } from '@/schedule';
import { Task } from '@/schedule/protocols';
import { logger } from '@/util';

export const makeExampleTask = (): Task => {
  return new ExampleTask(logger);
};
