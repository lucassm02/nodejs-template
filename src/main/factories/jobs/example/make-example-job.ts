import { ExampleJob } from '@/job';
import { logger } from '@/util';

import { makeErrorHandler } from '../../usecases';

export const makeExampleJob = () => {
  return new ExampleJob(logger, makeErrorHandler());
};
