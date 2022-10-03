import { TroubleExampleJob } from '@/consumer';
import { ExampleTrouble } from '@/data/usecases/example';
import { logger } from '@/util';

export const makeTroubleExampleJob = () => {
  const exampleTrouble = new ExampleTrouble();
  return new TroubleExampleJob(exampleTrouble, logger);
};
