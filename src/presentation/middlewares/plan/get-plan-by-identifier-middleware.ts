import { Logger } from '@/data/protocols/utils';
import { ErrorHandler } from '@/data/usecases/exception';
import { GetPlanByIdentifier } from '@/domain/usecases';
import { Middleware } from '@/presentation/protocols/middleware';
import { notFound, serverError } from '@/presentation/utils';
import { DICTIONARY } from '@/util';
import { template } from '@/util/formatters';

export class GetPlanByIdentifierMiddleware implements Middleware {
  constructor(
    private readonly getPlanByIdentifier: GetPlanByIdentifier,
    private readonly logger: Logger,
    private readonly errorHandler: ErrorHandler
  ) {}

  async handle(
    httpRequest: Middleware.HttpRequest,
    [, setState]: Middleware.State,
    next: Middleware.Next
  ): Middleware.Result {
    try {
      const identifier = httpRequest.body.planId ?? httpRequest.params.planId;

      const plan = await this.getPlanByIdentifier.getByExternalId(identifier);

      this.logger.log({
        level: 'debug',
        message: 'GET PLAN BY IDENTIFIER',
        payload: { plan },
      });

      setState({ getPlanByIdentifier: plan });

      return next();
    } catch (error) {
      this.errorHandler.handle(error);
      switch (error.message) {
        case GetPlanByIdentifier.Exceptions.PLAN_NOT_FOUND:
          return notFound(
            template(DICTIONARY.RESPONSE.MESSAGE.NOT_FOUND, 'plano')
          );
        default:
          return serverError(error);
      }
    }
  }
}
