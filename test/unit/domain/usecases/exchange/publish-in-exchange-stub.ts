import { PublishInExchange } from '@/domain/usecases';

export class PublishInExchangeStub implements PublishInExchange {
  async publish(): PublishInExchange.Result {}
}
