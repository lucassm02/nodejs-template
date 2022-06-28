import { Logger } from '@/data/protocols/utils';
import { ValidateAuthenticationKey } from '@/domain/usecases/authentication-key/validate-authentication-key';
import { Middleware } from '@/presentation/protocols/middleware';
import { serverError } from '@/presentation/utils';

export class ValidateAuthenticationKeyMiddleware implements Middleware {
  constructor(
    private readonly validateAuthenticationKey: ValidateAuthenticationKey,
    private readonly logger: Logger
  ) {}

  async handle(
    httpRequest: Middleware.HttpRequest,
    [, setState]: Middleware.State,
    next: Middleware.Next
  ): Middleware.Result {
    try {
      const authentication = httpRequest.headers.authentication as string;

      if (!authentication) throw new Error('AUTHENTICATION_NOT_PROVIDED');

      const authenticationKey = await this.validateAuthenticationKey.validate(
        authentication
      );

      this.logger.log({
        level: 'debug',
        message: 'VALIDATE AUTHENTICATION KEY',
        payload: { authenticationKey },
      });

      setState({ validateAuthenticationKey: authenticationKey });

      return next();
    } catch (error) {
      this.logger.log(error);
      switch (error.message) {
        default:
          return serverError(error);
      }
    }
  }
}
