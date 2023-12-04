import { PublishInExchangeService } from '@/data/protocols/mq/publish-in-exchange';
import { PublishInExchange } from '@/domain/usecases';

export class MqPublishInExchange implements PublishInExchange {
  constructor(
    private readonly publishInExchangeService: PublishInExchangeService
  ) {}
  async publish({
    exchange,
    routingKey,
    value
  }: PublishInExchange.Params): PublishInExchange.Result {
    if (!Array.isArray(value)) {
      await this.publishInExchangeService.publishInExchange(
        exchange,
        value,
        routingKey
      );
      return;
    }

    if (value.length === 0) return;

    const promises = value.map((value) =>
      this.publishInExchangeService.publishInExchange(
        exchange,
        value,
        routingKey
      )
    );

    await Promise.all(promises);
  }
}
