import { Logger } from '@/data/protocols/util';
import { ErrorHandler } from '@/domain/usecases';
import { ValidateToken } from '@/domain/usecases/token';
import { Middleware } from '@/presentation/protocols/middleware';
import { serverError, unauthorized } from '@/presentation/utils';
import { DICTIONARY } from '@/util';
import { makeErrorDescription } from '@/util/formatters';

export class ValidateTokenMiddleware implements Middleware {
  constructor(
    private readonly validateToken: ValidateToken,
    private readonly logger: Logger,
    private readonly errorHandler: ErrorHandler
  ) {}

  async handle(
    httpRequest: Middleware.HttpRequest,
    [, setState]: Middleware.State,
    next: Middleware.Next
  ): Middleware.Result {
    try {
      const authorization = httpRequest.headers.authorization as string;

      if (!authorization)
        return unauthorized(DICTIONARY.RESPONSE.MESSAGE.UNAUTHORIZED);

      const token = await this.validateToken.validate(authorization);
      const data = { encryptedToken: authorization, token };

      this.logger.log({
        level: 'debug',
        message: 'PUBLISH RECHARGE IN EXCHANGE',
        payload: { tokenData: data }
      });

      setState({
        validateToken: data
      });

      return next();
    } catch (error) {
      await this.errorHandler.handle(error);
      switch (error.message) {
        case ValidateToken.Exceptions.ERROR_ON_DECRYPTING:
        case ValidateToken.Exceptions.INVALID_TOKEN:
          return unauthorized(
            DICTIONARY.RESPONSE.MESSAGE.UNAUTHORIZED,
            makeErrorDescription(
              'Authorization',
              DICTIONARY.RESPONSE.DESCRIPTION.UNAUTHORIZED
            )
          );
        default:
          return serverError(error);
      }
    }
  }
}
