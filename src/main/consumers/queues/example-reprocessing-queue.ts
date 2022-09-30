import { consumerAdapter } from '@/main/adapters';
import {
  makeExampleJob,
  makeTroubleExampleJob,
  makeNormalizeReprocessingPayloadJob,
} from '@/main/factories/jobs';

import { Options } from '../protocols';

export const exampleReprocessingQueue: Options = {
  enabled: true,
  queue: 'example-reprocessing-queue',
  handler: consumerAdapter(
    makeNormalizeReprocessingPayloadJob(),
    makeTroubleExampleJob(),
    makeExampleJob()
  ),
};
