import { consumerAdapter } from '@/main/adapters';
import { makeExampleJob, makeTroubleExampleJob } from '@/main/factories/jobs';

import { Options } from '../protocols';

export const exampleReprocessingQueue: Options = {
  enabled: true,
  queue: 'example-reprocessing-queue',
  handler: consumerAdapter(makeTroubleExampleJob(), makeExampleJob()),
};
