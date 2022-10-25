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
    payload: Job.Payload,
    [state, setState]: Job.State,
    next: Job.Next
  ): Job.Result {
    try {
      this.troubleExample.trouble({
        current: 2,
      });

      return next();
    } catch (error) {
      this.logger.log({ level: 'error', ...error });
      throw error;
    }
  }
}
