import { GetReprocessingData, ErrorHandler } from '@/domain/usecases';
import { Middleware } from '@/presentation/protocols';
import { notFound, serverError } from '@/presentation/utils';
import { DICTIONARY, template } from '@/util';

export class GetReprocessingDataMiddleware implements Middleware {
  constructor(
    private readonly getReprocessingData: GetReprocessingData,
    private readonly errorHandler: ErrorHandler
  ) {}

  async handle(
    httpRequest: Middleware.HttpRequest,
    [, setState]: Middleware.State,
    next: Middleware.Next
  ): Middleware.Result {
    try {
      const reprocessing = await this.getReprocessingData.get({
        queue: <string>httpRequest.query?.queue,
        exchange: <string>httpRequest.query?.exchange,
        finalDate: <string>httpRequest.query?.finalDate,
        routingKey: <string>httpRequest.query?.routingKey,
        initialDate: <string>httpRequest.query?.initialDate
      });

      setState({ getReprocessingData: reprocessing });
      return next();
    } catch (error) {
      await this.errorHandler.handle(error);
      switch (error.message) {
        case GetReprocessingData.Exceptions.REPROCESSING_DATA_NOT_FOUND:
          return notFound(
            template(
              DICTIONARY.RESPONSE.MESSAGE.NOT_FOUND,
              'Dados para reprocessamento'
            ),
            {}
          );
        default:
          return serverError(error);
      }
    }
  }
}
