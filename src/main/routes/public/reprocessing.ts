import { Route } from '@/infra/http/utils/http-server/types';
import {
  makeDeleteProcessingByIdentifierMiddleware,
  makeGetReprocessingDataByIdentifierMiddleware,
  makePublishDataToReprocessingMiddleware
} from '@/main/factories/middlewares';

export default function (route: Route) {
  route.post(
    '/reprocessing',
    makeGetReprocessingDataByIdentifierMiddleware(),
    makePublishDataToReprocessingMiddleware(),
    makeDeleteProcessingByIdentifierMiddleware()
  );
}
