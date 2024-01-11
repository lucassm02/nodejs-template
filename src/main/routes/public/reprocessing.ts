import { Route } from '@/infra/http/utils/http-server/types';
import { makeGetReprocessingDataByIdentifierMiddleware } from '@/main/factories/middlewares';

export default function (route: Route) {
  route.post('/reprocessing', makeGetReprocessingDataByIdentifierMiddleware());
}
