import { Logger } from '@/data/protocols/utils';
import { CreateExample, ErrorHandler } from '@/domain/usecases';
import { Middleware } from '@/presentation/protocols';
import { serverError, stateDependencies } from '@/presentation/utils';

export class CreateExampleMiddleware implements Middleware {
  constructor(
    private readonly createExample: CreateExample,
    private readonly logger: Logger,
    private readonly errorHandler: ErrorHandler
  ) {}

  @stateDependencies(['validateToken'])
  async handle(
    _httpRequest: Middleware.HttpRequest,
    [state, setState]: Middleware.State,
    next: Middleware.Next
  ): Middleware.Result {
    try {
      const { record, transaction } = await this.createExample.create({
        description: 'DESCRIPTION',
        value: 'VALUE',
      });

      this.logger.log({
        level: 'debug',
        message: 'CREATE EXAMPLE',
        payload: { example: record },
      });

      setState({
        createExample: record,
        transactions: [...state.transactions, transaction],
      });

      return next();
    } catch (error) {
      await this.errorHandler.handle(error, state.transactions);
      switch (error.message) {
        default:
          return serverError(error);
      }
    }
  }
}
