import { NormalizeReprocessingPayloadJob } from '@/consumer/jobs/utils';
import { logger } from '@/util';

export const makeNormalizeReprocessingPayloadJob = () =>
  new NormalizeReprocessingPayloadJob(logger);
