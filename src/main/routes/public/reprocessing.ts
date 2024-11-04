import { Route } from '@/infra/http/util/web-server/types';
import { requestValidationAdapter } from '@/main/adapters';
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
import {
  getReprocessingDataSchema,
  publishDataToReprocessSchema
} from '@/validation/usecases';

export default function (route: Route) {
  route.post(
    '/reprocessings',
    requestValidationAdapter(publishDataToReprocessSchema),
    makeGetReprocessingDataByIdentifierMiddleware(),
    makePublishDataToReprocessingMiddleware(),
    makeDeleteReprocessingByIdentifierMiddleware(),
    makePublishDataToReprocessController()
  );

  route.get(
    '/reprocessings',
    requestValidationAdapter(getReprocessingDataSchema),
    makeGetReprocessingDataMiddleware(),
    makeGetReprocessingDataController()
  );
}
