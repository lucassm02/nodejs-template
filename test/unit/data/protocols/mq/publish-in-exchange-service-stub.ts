import { PublishInExchangeService } from '@/data/protocols/mq';

export class PublishInExchangeServiceStub implements PublishInExchangeService {
  async publishInExchange(): Promise<void> {}
}
