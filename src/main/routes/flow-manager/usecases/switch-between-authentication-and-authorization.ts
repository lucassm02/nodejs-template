import { httpServer } from '@/infra/http/utils/http-server';
import { Option } from '@/main/adapters/flow-manager';
import { makeNoAuthenticationController } from '@/main/factories/controllers';
import {
  makeAuthenticateByAuthenticationMiddleware,
  makeValidateTokenMiddleware,
} from '@/main/factories/middlewares';

const server = httpServer();

export const switchBetweenAuthenticationAndAuthorization: Option[] = [
  {
    when: 'headers.authorization',
    handler: server.adapter(makeValidateTokenMiddleware()),
  },
  {
    when: 'headers.authentication',
    handler: server.adapter(makeAuthenticateByAuthenticationMiddleware()),
  },
  {
    handler: server.adapter(makeNoAuthenticationController()),
  },
];
