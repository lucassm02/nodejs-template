import { UpdateEventJob } from '@/consumer/jobs/event';
import { EsUpdateEvent } from '@/data/usecases/elasticsearch';
import { Elasticsearch } from '@/infra/service';
import { getAPMTransactionIds, logger, merge } from '@/util';

import { makeErrorHandler } from '../../usecases';

export const makeUpdateEventJob = () => {
  const elasticsearch = new Elasticsearch();
  const esUpdateEvent = new EsUpdateEvent(
    elasticsearch,
    elasticsearch,
    getAPMTransactionIds,
    merge
  );
  return new UpdateEventJob(esUpdateEvent, logger, makeErrorHandler());
};
