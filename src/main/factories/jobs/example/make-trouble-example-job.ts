import { ExampleTrouble } from '@/data/usecases/other/example';
import { TroubleExampleJob } from '@/job';
import { logger } from '@/util';

export const makeTroubleExampleJob = () => {
  const exampleTrouble = new ExampleTrouble();
  return new TroubleExampleJob(exampleTrouble, logger);
};
