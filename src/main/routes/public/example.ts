import { Route } from '@/infra/http/utils/http-server';
import {
  makeCreateExampleController,
  makeGetExampleController,
} from '@/main/factories/controllers';
import {
  makeCreateExampleMiddleware,
  makeGetExampleMiddleware,
} from '@/main/factories/middlewares';

export default function (route: Route) {
  route.get(
    '/examples',
    makeGetExampleMiddleware(),
    makeGetExampleController()
  );

  route.post(
    '/examples',
    makeCreateExampleMiddleware(),
    makeCreateExampleController()
  );
}
