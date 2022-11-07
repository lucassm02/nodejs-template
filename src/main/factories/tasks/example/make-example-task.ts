import { ExampleTask } from '@/schedule';
import { Task } from '@/schedule/protocols';
import { logger } from '@/util';

import { makeErrorHandler } from '../../usecases';

export const makeExampleTask = (): Task => {
  return new ExampleTask(logger, makeErrorHandler());
};
