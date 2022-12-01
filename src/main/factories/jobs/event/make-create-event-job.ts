import { CreateEventJob } from '@/consumer/jobs/event';
import { EsCreateEvent } from '@/data/usecases/elasticsearch';
import { Elasticsearch } from '@/infra/service';
import { formatDate, getAPMTransactionIds, logger } from '@/util';

import { makeErrorHandler } from '../../usecases';

export const makeCreateEventJob = () => {
  const elasticsearch = new Elasticsearch();
  const esCreateEvent = new EsCreateEvent(
    elasticsearch,
    getAPMTransactionIds,
    formatDate
  );
  return new CreateEventJob(esCreateEvent, logger, makeErrorHandler());
};
