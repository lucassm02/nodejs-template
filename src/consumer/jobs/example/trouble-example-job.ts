import { Job } from '@/consumer/protocols';
import { skipMiddleware } from '@/consumer/utils';
import { Logger } from '@/data/protocols/utils';
import { SendReprocessing, TroubleExample } from '@/domain/usecases';

export class TroubleExampleJob implements Job {
  constructor(
    private readonly troubleExample: TroubleExample,
    private readonly sendReprocessing: SendReprocessing,
    private readonly logger: Logger
  ) {}

  async handle(
    payload: Job.Payload,
    [state, setState]: Job.State,
    next: Job.Next
  ): Job.Result {
    try {
      if (skipMiddleware(state.reprocessing, Job.Middlewares.TROUBLE_EXAMPLE))
        return next();

      this.troubleExample.trouble({
        current: 2,
      });

      setState({
        reprocessing: { ...state.reprocessing, middleware: null },
      });
      return next();
    } catch (error) {
      this.sendReprocessing.reprocess({
        middleware: Job.Middlewares.TROUBLE_EXAMPLE,
        tries: state.reprocessing.tries,
        progress: { step: error.step, total: error.total },
        data: { state, payload },
      });
      this.logger.log(error.err);
    }
  }
}
