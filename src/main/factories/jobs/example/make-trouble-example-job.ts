import { TroubleExampleJob } from '@/consumer';
import { ExampleTrouble } from '@/data/usecases/example';
import { MqSendExampleReprocessing } from '@/data/usecases/mq';
import { rabbitMqServer } from '@/infra/mq/utils';
import { logger, REPROCESSING } from '@/util';

export const makeTroubleExampleJob = () => {
  const mqServer = rabbitMqServer();
  const mqSendExampleReprocessing = new MqSendExampleReprocessing(
    mqServer,
    REPROCESSING.MAX_TRIES,
    REPROCESSING.DELAYS
  );
  const exampleTrouble = new ExampleTrouble();
  return new TroubleExampleJob(
    exampleTrouble,
    mqSendExampleReprocessing,
    logger
  );
};
