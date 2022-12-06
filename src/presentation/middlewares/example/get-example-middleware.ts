import { Logger } from '@/data/protocols/utils';
import { ErrorHandler, GetExample } from '@/domain/usecases';
import { Middleware } from '@/presentation/protocols/middleware';
import { serverError } from '@/presentation/utils';

export class GetExampleMiddleware implements Middleware {
  constructor(
    private readonly getExample: GetExample,
    private readonly logger: Logger,
    private readonly errorHandler: ErrorHandler
  ) {}

  async handle(
    _httpRequest: Middleware.HttpRequest,
    [, setState]: Middleware.State,
    next: Middleware.Next
  ): Middleware.Result {
    try {
      const example = await this.getExample.get();

      this.logger.log({
        level: 'debug',
        message: 'GET EXAMPLE',
        payload: { example },
      });

      setState({ getExample: example });

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
