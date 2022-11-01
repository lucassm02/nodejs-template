import { Job } from '@/consumer/protocols';
import { reprocessing } from '@/consumer/utils';
import { Logger } from '@/data/protocols/utils';
import { TroubleExample } from '@/domain/usecases';

export class TroubleExampleJob implements Job {
  constructor(
    private readonly troubleExample: TroubleExample,
    private readonly logger: Logger
  ) {}

  @reprocessing({
    queueOptions: { exchange: 'example-delayed' },
  })
  async handle(
    _payload: Job.Payload,
    [{ reprocessing }]: Job.State,
    next: Job.Next
  ): Job.Result {
    try {
      const step = reprocessing.progress ? reprocessing.progress.step : 0;

      this.troubleExample.trouble({
        current: 2,
        step,
      });

      return next();
    } catch (error) {
      this.logger.log({ level: 'error', ...error });
      throw error;
    }
  }
}
