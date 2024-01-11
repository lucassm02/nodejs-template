import { MqPublishDataToReprocessing } from '@/data/usecases/mq';
import { rabbitMqServer } from '@/infra/mq/utils';
import { PublishDataToReprocessingMiddleware } from '@/presentation/middlewares';

import { makeErrorHandler } from '../../usecases';

export const makePublishDataToReprocessingMiddleware = () => {
  const mqServer = rabbitMqServer();
  const mqPublishInQueue = new MqPublishDataToReprocessing(mqServer);

  return new PublishDataToReprocessingMiddleware(
    mqPublishInQueue,
    makeErrorHandler()
  );
};
