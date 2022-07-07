import { Route } from '@/infra/http/utils/http-server';
import { makeGetPlanByIdController } from '@/main/factories/controllers';
import {
  makeAuthenticateByAuthenticationMiddleware,
  makeGetPlanByIdentifierMiddleware,
} from '@/main/factories/middlewares';

export default function (route: Route) {
  route.get(
    '/plans',
    makeAuthenticateByAuthenticationMiddleware(),
    makeGetPlanByIdentifierMiddleware(),
    makeGetPlanByIdController()
  );
}
