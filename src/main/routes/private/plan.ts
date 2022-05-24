import { HttpServer } from '@/infra/http/utils';
import { makeGetPlanByIdController } from '@/main/factories/controllers';
import {
  makeAuthenticateByAuthenticationMiddleware,
  makeGetPlanByIdentifierMiddleware,
} from '@/main/factories/middlewares';

const server = HttpServer.getInstance();

server.use(makeAuthenticateByAuthenticationMiddleware());

server.get(
  '/plan',
  makeGetPlanByIdentifierMiddleware(),
  makeGetPlanByIdController()
);
