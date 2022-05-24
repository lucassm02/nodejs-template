import { Logger } from '@/data/protocols/utils';
import { Job } from '@/task/protocols';

export class GetLocalCustomerAccountJob implements Job {
  constructor(private readonly logger: Logger) {}
  async handle(state: Job.State, next: Job.Next): Job.Result {
    try {
      const [{ validateToken }, setState] = state;

      if (!validateToken) throw new Error('VALIDATE_TOKEN_JOB_NOT_IN_USE');

      next();
    } catch (error) {
      this.logger.log(error);
    }
  }
}
