import { Logger } from '@/data/protocols/utils';
import { ErrorHandler, PublishInExchange } from '@/domain/usecases';
import { ExtractValues } from '@/plugin';
import { Middleware } from '@/presentation/protocols';
import { serverError } from '@/presentation/utils';

type ArgsType = {
  routingKey: string;
  exchange: string;
};

export class MqPublishInExchangeMiddleware
  extends ExtractValues
  implements Middleware
{
  constructor(
    private readonly args: ArgsType,
    private readonly publishInExchange: PublishInExchange,
    private readonly errorHandler: ErrorHandler,
    private readonly logger: Logger,
    valuesToExtract: (string | Record<string, string>)[]
  ) {
    super(valuesToExtract);
  }
  async handle(
    httpRequest: Middleware.HttpRequest,
    [state]: Middleware.State,
    next: Middleware.Next
  ): Middleware.Result {
    try {
      const { exchange, routingKey } = this.args;

      const payload = this.extractValuesFromSources({
        request: {
          body: httpRequest.body,
          params: httpRequest.params,
          query: httpRequest.query
        },
        state
      });

      await this.publishInExchange.publish({
        exchange,
        routingKey,
        value: payload
      });

      this.logger.log({
        level: 'debug',
        message: 'PUBLISH IN EXCHANGE',
        payload: { ...payload }
      });

      return next();
    } catch (error) {
      await this.errorHandler.handle(error);
      switch (error.message) {
        default:
          return serverError(error);
      }
    }
  }
}
