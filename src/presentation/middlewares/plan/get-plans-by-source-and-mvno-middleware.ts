import { Logger } from '@/data/protocols/utils';
import { ErrorHandler } from '@/data/usecases/exception';
import { GetPlansBySourceAndMvno } from '@/domain/usecases/plan';
import { Middleware } from '@/presentation/protocols';
import { notFound, serverError, stateDependencies } from '@/presentation/utils';
import { DICTIONARY } from '@/util';

export class GetPlansBySourceAndMvnoMiddleware implements Middleware {
  constructor(
    private readonly listPlansBySourceMvnoId: GetPlansBySourceAndMvno,
    private readonly logger: Logger,
    private readonly errorHandler: ErrorHandler
  ) {}

  @stateDependencies(['validateToken'])
  async handle(
    httpRequest: Middleware.HttpRequest,
    [{ validateToken }, setState]: Middleware.State,
    next: Middleware.Next
  ): Middleware.Result {
    try {
      const plans = await this.listPlansBySourceMvnoId.get({
        sourceId: validateToken.token.payload.sourceId,
        mvnoId: validateToken.token.payload.mvnoId,
      });

      this.logger.log({
        level: 'debug',
        message: 'GET PLANS BY SOURCE AND MVNO',
        payload: { plans },
      });

      setState({ getPlansBySourceAndMvno: plans });

      return next();
    } catch (error) {
      this.errorHandler.handle(error);
      switch (error.message) {
        case GetPlansBySourceAndMvno.Exceptions.PLANS_NOT_FOUND:
          return notFound(DICTIONARY.RESPONSE.MESSAGE.NONE_WAS_FOUND, 'plano');
        default:
          return serverError(error);
      }
    }
  }
}
