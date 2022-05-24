import { Job } from '@/consumer/protocols';
import { Logger } from '@/data/protocols/utils';

export class GetLocalCustomerAccountJob implements Job {
  constructor(private readonly logger: Logger) {}
  async handle(_: Job.Payload, state: Job.State, next: Job.Next): Job.Result {
    try {
      const [{ validateToken }, setState] = state;

      if (!validateToken) throw new Error('VALIDATE_TOKEN_JOB_NOT_IN_USE');

      next();
    } catch (error) {
      this.logger.log(error);
    }
  }
}
