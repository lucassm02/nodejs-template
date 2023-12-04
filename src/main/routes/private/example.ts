import { Route } from '@/infra/http/utils/http-server';
import {
  makeCreateExampleController,
  makeGetExampleController
} from '@/main/factories/controllers';
import {
  makeCreateExampleMiddleware,
  makeGetExampleMiddleware,
  makeSaveInCacheMiddleware
} from '@/main/factories/middlewares';

export default function (route: Route) {
  route.get(
    '/examples',
    makeGetExampleMiddleware({ context: 'CREATE_EXAMPLE' }),
    makeGetExampleController()
  );

  route.post(
    '/examples',
    makeCreateExampleMiddleware(),
    makeSaveInCacheMiddleware({
      key: 'createExample',
      value: 'createExample',
      ttl: 60 * 5 // 5 minutes of cache
    }),
    makeCreateExampleController()
  );
}
