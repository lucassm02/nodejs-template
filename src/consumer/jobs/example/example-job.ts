import { Job } from '@/consumer/protocols';
import { Logger } from '@/data/protocols/utils';
import { ErrorHandler } from '@/data/usecases/exception';

export class ExampleJob implements Job {
  constructor(
    private readonly logger: Logger,
    private readonly errorHandler: ErrorHandler
  ) {}
  async handle(
    payload: Job.Payload,
    state: Job.State,
    next: Job.Next
  ): Job.Result {
    try {
      this.logger.log({ level: 'info', message: "Hello i'm a task" });
      next();
    } catch (error) {
      this.errorHandler.handle(error);
    }
  }
}
