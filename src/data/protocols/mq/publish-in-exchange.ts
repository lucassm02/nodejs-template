export interface PublishInExchangeService {
  publishInExchange(
    exchange: string,
    message: object,
    routingKey: string,
    headers?: object
  ): Promise<void>;
}
