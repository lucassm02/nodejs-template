import { Controller, HttpRequest } from '@/presentation/protocols';
import { ok, stateDependencies } from '@/presentation/utils';

export class GetReprocessingDataController implements Controller {
  @stateDependencies(['getReprocessingData'])
  async handle(
    httpRequest: HttpRequest,
    [{ getReprocessingData }]: Controller.State
  ): Controller.Result {
    const reprocessingIds = getReprocessingData.map(
      ({ reprocessingId }) => reprocessingId
    );

    const verbose = <boolean>(<unknown>httpRequest.query?.verbose);

    const notVerbose = getReprocessingData.map(
      ({ reprocessingId, reprocessing }) => {
        return {
          reprocessingId,
          middleware: reprocessing.middleware,
          tries: reprocessing.tries,
          body: reprocessing.data.payload.body
        };
      }
    );

    const body = verbose
      ? { reprocessingIds, reprocessings: getReprocessingData }
      : { reprocessingIds, reprocessings: notVerbose };

    return ok('', body);
  }
}
