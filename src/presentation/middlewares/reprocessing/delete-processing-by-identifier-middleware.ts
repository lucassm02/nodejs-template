import { DeleteProcessingByIdentifier, ErrorHandler } from '@/domain/usecases';
import { Middleware } from '@/presentation/protocols';
import { serverError, stateDependencies } from '@/presentation/utils';

export class DeleteProcessingByIdentifierMiddleware implements Middleware {
  constructor(
    private readonly deleteProcessingByIdentifier: DeleteProcessingByIdentifier,
    private readonly errorHandler: ErrorHandler
  ) {}

  @stateDependencies(['getReprocessingDataByIdentifier'])
  async handle(
    _httpRequest: Middleware.HttpRequest,
    [{ getReprocessingDataByIdentifier }]: Middleware.State,
    next: Middleware.Next
  ): Middleware.Result {
    try {
      await this.deleteProcessingByIdentifier.delete(
        getReprocessingDataByIdentifier
      );
      return next();
    } catch (error) {
      await this.errorHandler.handle(error);
      return serverError(error);
    }
  }
}
