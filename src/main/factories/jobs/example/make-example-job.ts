import { ExampleJob } from '@/consumer';
import { logger } from '@/util';

export const makeExampleJob = () => {
  return new ExampleJob(logger);
};
