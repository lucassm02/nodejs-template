import { Route } from '@/infra/http/utils/http-server/types';
import {
  makeGetReprocessingDataController,
  makePublishDataToReprocessController
} from '@/main/factories/controllers';
import {
  makeDeleteProcessingByIdentifierMiddleware,
  makeGetReprocessingDataMiddleware,
  makeGetReprocessingDataByIdentifierMiddleware,
  makePublishDataToReprocessingMiddleware
} from '@/main/factories/middlewares';

export default function (route: Route) {
  route.post(
    '/reprocessings',
    makeGetReprocessingDataByIdentifierMiddleware(),
    makePublishDataToReprocessingMiddleware(),
    makeDeleteProcessingByIdentifierMiddleware(),
    makePublishDataToReprocessController()
  );

  route.get(
    '/reprocessings',
    makeGetReprocessingDataMiddleware(),
    makeGetReprocessingDataController()
  );
}
