import { Route } from '@/infra/http/utils/http-server';
import {
  makeCreateExampleController,
  makeGetExampleController
} from '@/main/factories/controllers';
import {
  makeCreateExampleMiddleware,
  makeGetCacheValueMiddleware,
  makeGetExampleMiddleware,
  makeMqPublishInExchangeMiddleware,
  makeSaveInCacheMiddleware
} from '@/main/factories/middlewares';

const fiveMinutes = 60 * 5;

export default function (route: Route) {
  route.get(
    '/examples',
    makeGetCacheValueMiddleware({
      key: 'example',
      options: {
        parseToJson: true
      },
      throws: false
    }),
    makeGetExampleMiddleware({ context: 'CREATE_EXAMPLE' }),
    makeGetExampleController()
  );

  route.post(
    '/examples',
    makeCreateExampleMiddleware(),
    makeSaveInCacheMiddleware({
      key: 'example',
      value: 'createExample',
      ttl: fiveMinutes
    }),
    makeMqPublishInExchangeMiddleware({
      context: 'PUBLISH_EXAMPLE',
      exchange: 'example',
      routingKey: 'example'
    }),
    makeCreateExampleController()
  );
}
