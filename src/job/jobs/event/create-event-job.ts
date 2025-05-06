import { Logger } from '@/data/protocols/util';
import { CreateEvent, ErrorHandler } from '@/domain/usecases';
import { Job } from '@/job/protocols';
import { ELASTICSEARCH } from '@/util';

export class CreateEventJob implements Job {
  constructor(
    private readonly createEvent: CreateEvent,
    private readonly logger: Logger,
    private readonly errorHandler: ErrorHandler
  ) {}
  async handle(
    payload: Job.Payload,
    [, setState]: Job.State,
    next: Job.Next
  ): Job.Result {
    try {
      if (!ELASTICSEARCH.ENABLED) return next();

      const event = await this.createEvent.create({
        event: '',
        mvno: '',
        status: 'CREATED',
        payload: payload.body
      });

      this.logger.log({
        level: 'debug',
        message: 'CREATE EVENT',
        payload: event
      });

      setState({ createEven: event });

      next();
    } catch (error) {
      await this.errorHandler.handle(error);
      next();
    }
  }
}
