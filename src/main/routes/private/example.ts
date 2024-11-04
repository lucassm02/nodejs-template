import { Route } from '@/infra/http/util/web-server';
import {
  makeCreateExampleController,
  makeGetExampleController,
  makeGreetingWebsocketController
} from '@/main/factories/controllers';
import {
  makeCreateExampleMiddleware,
  makeGetCacheValueMiddleware,
  makeGetExampleMiddleware,
  makeMqPublishInExchangeMiddleware,
  makeSaveInCacheMiddleware
} from '@/main/factories/middlewares';

const DEFAULT_CACHE_TTL = 60 * 5;

export default function (route: Route) {
  route.get(
    '/examples',
    makeGetCacheValueMiddleware({
      value: 'createExample',
      key: 'BACKEND.EXAMPLE',
      subKey: 'exampleId',
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
      value: 'createExample',
      key: 'BACKEND.EXAMPLE',
      subKey: 'exampleId',
      extractField: 'exampleId',
      ttl: DEFAULT_CACHE_TTL
    }),
    makeMqPublishInExchangeMiddleware({
      context: 'PUBLISH_EXAMPLE',
      exchange: 'example',
      routingKey: 'example'
    }),
    makeCreateExampleController()
  );

  route.ws().on('message', makeGreetingWebsocketController());
}
