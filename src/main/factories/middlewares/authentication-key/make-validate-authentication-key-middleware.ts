import { DbValidateAuthenticationKey } from '@/data/usecases/db/authentication-key';
import { ValidateAuthenticationKeyMiddleware } from '@/presentation/middlewares';
import { logger } from '@/util';

import { makeErrorHandler } from '../../usecases';

export const makeAuthenticateByAuthenticationMiddleware = () => {
  const dbValidateAuthenticationKey = new DbValidateAuthenticationKey();
  return new ValidateAuthenticationKeyMiddleware(
    dbValidateAuthenticationKey,
    logger,
    makeErrorHandler()
  );
};
