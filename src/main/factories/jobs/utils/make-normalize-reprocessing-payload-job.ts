import { NormalizeReprocessingPayloadJob } from '@/consumer/jobs/utils';
import { logger } from '@/util';

import { makeErrorHandler } from '../../usecases';

export const makeNormalizeReprocessingPayloadJob = () =>
  new NormalizeReprocessingPayloadJob(logger, makeErrorHandler());
