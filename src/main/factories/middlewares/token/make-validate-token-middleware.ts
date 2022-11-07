import { HttpValidateToken } from '@/data/usecases/http/token';
import { SecretToken } from '@/infra/encryption';
import { RequestAdapter } from '@/infra/http/service/adapters';
import { ValidateTokenService } from '@/infra/http/service/authenticator';
import { httpAuthenticator } from '@/infra/http/service/utils/http-authentication';
import { ValidateTokenMiddleware } from '@/presentation/middlewares';
import { logger } from '@/util';

import { makeErrorHandler } from '../../usecases';

export const makeValidateTokenMiddleware = () => {
  const httpClient = new RequestAdapter(httpAuthenticator);
  const validateTokenService = new ValidateTokenService(httpClient);

  const secretToken = new SecretToken();

  const httpValidateToken = new HttpValidateToken(
    secretToken,
    validateTokenService
  );

  return new ValidateTokenMiddleware(
    httpValidateToken,
    logger,
    makeErrorHandler()
  );
};
