import { Job } from '@/consumer/protocols';
import { Logger } from '@/data/protocols/utils';

export class ExampleJob implements Job {
  constructor(private readonly logger: Logger) {}
  async handle(
    payload: Job.Payload,
    state: Job.State,
    next: Job.Next
  ): Job.Result {
    try {
      this.logger.log({ level: 'info', message: 'Working!', payload });

      next();
    } catch (error) {
      this.logger.log(error);
    }
  }
}
