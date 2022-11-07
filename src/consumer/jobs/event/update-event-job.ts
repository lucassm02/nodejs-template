import { Job } from '@/consumer/protocols';
import { Logger } from '@/data/protocols/utils';
import { EsUpdateEvent } from '@/data/usecases/elasticsearch';

export class UpdateEventJob implements Job {
  constructor(
    private updateEvent: EsUpdateEvent,
    private readonly logger: Logger
  ) {}
  async handle(
    _payload: Job.Payload,
    _state: Job.State,
    next: Job.Next
  ): Job.Result {
    try {
      const event = await this.updateEvent.update({
        status: 'SUCCESS',
        updateAt: new Date(),
      });

      this.logger.log({
        level: 'debug',
        message: 'UPDATE EVENT',
        payload: event,
      });

      return next();
    } catch (error) {
      this.logger.log(error);
    }
  }
}
