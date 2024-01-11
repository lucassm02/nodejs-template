import { PublishInQueueService } from '@/data/protocols/mq/publish-in-queue';
import { PublishDataToReprocessing } from '@/domain/usecases';

export class MqPublishDataToReprocessing implements PublishDataToReprocessing {
  constructor(private readonly publishInQueueService: PublishInQueueService) {}
  async publish(
    params: PublishDataToReprocessing.Params
  ): PublishDataToReprocessing.Result {
    const promises = params.map(({ queue, reprocessing }) =>
      this.publishInQueueService.publishInQueue(queue, { reprocessing })
    );

    await Promise.all(promises);
  }
}
