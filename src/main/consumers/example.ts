import { RabbitMqServer } from '@/infra/mq/utils/rabbitmq-server';
import { makeExampleJob, makeTroubleExampleJob } from '@/main/factories/jobs';

export default (server: RabbitMqServer) => {
  server.makeConsumer(
    { queue: 'example-queue', enabled: false },
    makeExampleJob()
  );

  server.makeConsumer(
    'example-reprocessing-queue',
    makeTroubleExampleJob(),
    makeExampleJob()
  );
};
