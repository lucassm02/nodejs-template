import { PublishInQueueService } from '@/data/protocols/mq';

export class PublishInQueueServiceStub implements PublishInQueueService {
  async publishInQueue(): Promise<void> {}
}
