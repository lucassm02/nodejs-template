import {
  GetReprocessingDataByIdentifier,
  ErrorHandler
} from '@/domain/usecases';
import { Middleware } from '@/presentation/protocols';
import { notFound, serverError } from '@/presentation/utils';

export class GetReprocessingDataByIdentifierMiddleware implements Middleware {
  constructor(
    private readonly getReprocessingDataByIdentifier: GetReprocessingDataByIdentifier,
    private readonly errorHandler: ErrorHandler
  ) {}

  async handle(
    httpRequest: Middleware.HttpRequest,
    [, setState]: Middleware.State,
    next: Middleware.Next
  ): Middleware.Result {
    try {
      const reprocessingIds = <string[]>httpRequest.body.reprocessingIds;

      if (!reprocessingIds.length) return next();

      const dataToReprocessing = await this.getReprocessingDataByIdentifier.get(
        { reprocessingIds }
      );

      setState({ getReprocessingDataByIdentifier: dataToReprocessing });
      return next();
    } catch (error) {
      await this.errorHandler.handle(error);
      switch (error.message) {
        case GetReprocessingDataByIdentifier.Exceptions
          .REPROCESSING_DATA_NOT_FOUND:
          return notFound(
            'Não foi encontrado nenhum dado para reprocessamento.'
          );
        default:
          return serverError(error);
      }
    }
  }
}
