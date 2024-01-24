import {
  DeleteReprocessingByIdentifier,
  ErrorHandler
} from '@/domain/usecases';
import { Middleware } from '@/presentation/protocols';
import { serverError, stateDependencies } from '@/presentation/utils';

export class DeleteReprocessingByIdentifierMiddleware implements Middleware {
  constructor(
    private readonly deleteReprocessingByIdentifier: DeleteReprocessingByIdentifier,
    private readonly errorHandler: ErrorHandler
  ) {}

  @stateDependencies(['getReprocessingDataByIdentifier'])
  async handle(
    _httpRequest: Middleware.HttpRequest,
    [{ getReprocessingDataByIdentifier }]: Middleware.State,
    next: Middleware.Next
  ): Middleware.Result {
    try {
      await this.deleteReprocessingByIdentifier.delete(
        getReprocessingDataByIdentifier
      );
      return next();
    } catch (error) {
      await this.errorHandler.handle(error);
      return serverError(error);
    }
  }
}
