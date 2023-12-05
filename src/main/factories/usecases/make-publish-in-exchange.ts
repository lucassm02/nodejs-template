import { MqPublishInExchange } from '@/data/usecases/mq';
import { rabbitMqServer } from '@/infra/mq/utils';

export const makeMqPublishInExchange = () => {
  const mqServer = rabbitMqServer();
  return new MqPublishInExchange(mqServer);
};
