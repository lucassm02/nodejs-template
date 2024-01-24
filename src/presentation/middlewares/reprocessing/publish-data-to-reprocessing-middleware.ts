import { ErrorHandler, PublishDataToReprocessing } from '@/domain/usecases';
import { Middleware } from '@/presentation/protocols';
import { serverError, stateDependencies } from '@/presentation/utils';

export class PublishDataToReprocessingMiddleware implements Middleware {
  constructor(
    private readonly publishDataToReprocessing: PublishDataToReprocessing,
    private readonly errorHandler: ErrorHandler
  ) {}

  @stateDependencies(['getReprocessingDataByIdentifier'])
  async handle(
    _httpRequest: Middleware.HttpRequest,
    [{ getReprocessingDataByIdentifier }]: Middleware.State,
    next: Middleware.Next
  ): Middleware.Result {
    try {
      await this.publishDataToReprocessing.publish(
        getReprocessingDataByIdentifier
      );

      return next();
    } catch (error) {
      await this.errorHandler.handle(error);
      return serverError(error);
    }
  }
}
