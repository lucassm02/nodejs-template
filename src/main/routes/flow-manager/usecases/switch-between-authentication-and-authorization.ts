import { HttpServer } from '@/infra/http/utils/http-server';
import { adapterOptions } from '@/main/adapters';
import { makeNoAuthenticationController } from '@/main/factories/controllers';
import {
  makeAuthenticateByAuthenticationMiddleware,
  makeValidateTokenMiddleware,
} from '@/main/factories/middlewares';

const server = HttpServer.getInstance();

export const switchBetweenAuthenticationAndAuthorization: adapterOptions = [
  {
    target: { headers: 'authorization' },
    handle: server.adapter(makeValidateTokenMiddleware()),
  },
  {
    target: { headers: 'authentication' },
    handle: server.adapter(makeAuthenticateByAuthenticationMiddleware()),
  },
  {
    handle: server.adapter(makeNoAuthenticationController()),
  },
];
