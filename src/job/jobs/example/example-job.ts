import { Logger } from '@/data/protocols/util';
import { ErrorHandler } from '@/domain/usecases';
import { Job } from '@/job/protocols';

export class ExampleJob implements Job {
  constructor(
    private readonly logger: Logger,
    private readonly errorHandler: ErrorHandler
  ) {}
  async handle(
    payload: Job.Payload,
    _state: Job.State,
    next: Job.Next
  ): Job.Result {
    try {
      this.logger.log({
        level: 'info',
        message: "Hello i'm a job",
        payload
      });
      next();
    } catch (error) {
      await this.errorHandler.handle(error);
    }
  }
}
