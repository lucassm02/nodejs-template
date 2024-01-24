import { Controller, HttpRequest } from '@/presentation/protocols';
import { ok, stateDependencies } from '@/presentation/utils';
import { DICTIONARY, stringToBoolean, template } from '@/util';

export class GetReprocessingDataController implements Controller {
  @stateDependencies(['getReprocessingData'])
  async handle(
    httpRequest: HttpRequest,
    [{ getReprocessingData }]: Controller.State
  ): Controller.Result {
    const reprocessingIds = getReprocessingData.map(
      ({ reprocessingId }) => reprocessingId
    );

    const verbose = <string>httpRequest.query?.verbose;

    const notVerbose = getReprocessingData.map(
      ({ reprocessingId, reprocessing, createdAt }) => {
        return {
          reprocessingId,
          middleware: reprocessing.middleware,
          tries: reprocessing.tries,
          body: reprocessing.data.payload?.body,
          headers: reprocessing.data.payload?.headers,
          createdAt
        };
      }
    );

    const body = stringToBoolean(verbose)
      ? { reprocessingIds, reprocessings: getReprocessingData }
      : { reprocessingIds, reprocessings: notVerbose };

    return ok(
      template(DICTIONARY.RESPONSE.MESSAGE.OK, 'Reprocessamento listado'),
      body
    );
  }
}
