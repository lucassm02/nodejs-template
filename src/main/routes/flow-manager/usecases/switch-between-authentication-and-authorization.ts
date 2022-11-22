import { httpAdapter, Option } from '@/main/adapters/flow-manager';
import { makeNoAuthenticationController } from '@/main/factories/controllers';
import {
  makeAuthenticateByAuthenticationMiddleware,
  makeValidateTokenMiddleware,
} from '@/main/factories/middlewares';

export const switchBetweenAuthenticationAndAuthorization: Option[] = [
  {
    when: 'headers.authorization',
    handler: httpAdapter(makeValidateTokenMiddleware()),
  },
  {
    when: 'headers.authentication',
    handler: httpAdapter(makeAuthenticateByAuthenticationMiddleware()),
  },
  {
    handler: httpAdapter(makeNoAuthenticationController()),
  },
];
