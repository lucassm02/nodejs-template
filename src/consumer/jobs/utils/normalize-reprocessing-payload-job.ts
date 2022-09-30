import { Job } from '@/consumer/protocols';
import { runState } from '@/consumer/utils';
import { Logger } from '@/data/protocols/utils';
import { ReprocessingData } from '@/domain/models';

export class NormalizeReprocessingPayloadJob implements Job {
  constructor(private readonly logger: Logger) {}
  async handle(
    payload: Job.Payload<{
      reprocessing?: ReprocessingData;
    }>,
    [state, setState]: [any, Function],
    next: Job.Next
  ): Job.Result {
    try {
      if (!payload.body.reprocessing) {
        setState({ reprocessing: {} });
        return next();
      }

      runState(state, payload.body.reprocessing.data.state);

      setState({ reprocessing: payload.body.reprocessing });

      payload.headers = payload.body.reprocessing?.data.payload.headers;
      payload.body = payload.body.reprocessing.data.payload.body;

      return next();
    } catch (error) {
      this.logger.log(error);
    }
  }
}
