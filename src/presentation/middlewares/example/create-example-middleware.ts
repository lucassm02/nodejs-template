import { Logger } from '@/data/protocols/utils';
import { CreateExample, DataValidation, ErrorHandler } from '@/domain/usecases';
import { ExtractValues } from '@/plugin';
import { Middleware } from '@/presentation/protocols';
import {
  serverError,
  stateDependencies,
  unprocessableEntity
} from '@/presentation/utils';
import { DICTIONARY, template } from '@/util';
import { createExampleSchema } from '@/validation/usecases';

export class CreateExampleMiddleware
  extends ExtractValues
  implements Middleware
{
  constructor(
    private readonly createExample: CreateExample,
    private readonly logger: Logger,
    private readonly dataValidation: DataValidation,
    private readonly errorHandler: ErrorHandler,
    valuesToExtract: (string | Record<string, string>)[]
  ) {
    super(valuesToExtract);
  }

  @stateDependencies(['validateToken'])
  async handle(
    httpRequest: Middleware.HttpRequest,
    [state, setState]: Middleware.State,
    next: Middleware.Next
  ): Middleware.Result {
    try {
      const values = this.extractValuesFromSources({
        request: httpRequest,
        state
      });

      const params = await this.dataValidation.validate({
        data: values,
        exception: DataValidation.Exceptions.INVALID_DATA,
        schema: createExampleSchema
      });

      const { record, transaction } = await this.createExample.create(params);

      this.logger.log({
        level: 'debug',
        message: 'CREATE EXAMPLE',
        payload: { example: record }
      });

      setState({
        createExample: record,
        transactions: [...state.transactions, transaction]
      });

      return next();
    } catch (error) {
      await this.errorHandler.handle(error, state.transactions);
      switch (error.message) {
        case DataValidation.Exceptions.INVALID_DATA:
          return unprocessableEntity(
            template(
              DICTIONARY.RESPONSE.MESSAGE.INVALID_DATA,
              'criação de exemplo'
            )
          );
        default:
          return serverError(error);
      }
    }
  }
}
