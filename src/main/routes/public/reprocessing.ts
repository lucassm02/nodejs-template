import { Route } from '@/infra/http/utils/http-server/types';
import {
  makeGetReprocessingDataController,
  makePublishDataToReprocessController
} from '@/main/factories/controllers';
import {
  makeDeleteReprocessingByIdentifierMiddleware,
  makeGetReprocessingDataMiddleware,
  makeGetReprocessingDataByIdentifierMiddleware,
  makePublishDataToReprocessingMiddleware
} from '@/main/factories/middlewares';

export default function (route: Route) {
  route.post(
    '/reprocessings',
    makeGetReprocessingDataByIdentifierMiddleware(),
    makePublishDataToReprocessingMiddleware(),
    makeDeleteReprocessingByIdentifierMiddleware(),
    makePublishDataToReprocessController()
  );

  route.get(
    '/reprocessings',
    makeGetReprocessingDataMiddleware(),
    makeGetReprocessingDataController()
  );
}
