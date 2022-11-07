import { CreateEventJob } from '@/consumer/jobs/event';
import { EsCreateEvent } from '@/data/usecases/elasticsearch';
import { Elasticsearch } from '@/infra/service';
import { getAPMTransactionIds, logger } from '@/util';

export const makeCreateEventJob = () => {
  const elasticsearch = new Elasticsearch();
  const esCreateEvent = new EsCreateEvent(elasticsearch, getAPMTransactionIds);
  return new CreateEventJob(esCreateEvent, logger);
};
