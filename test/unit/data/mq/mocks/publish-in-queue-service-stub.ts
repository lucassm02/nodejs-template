import { PublishInQueueService } from '@/data/protocols/mq/publish-in-queue';

export class PublishInQueueServiceStub implements PublishInQueueService {
  async publishInQueue(): Promise<void> {}
}
