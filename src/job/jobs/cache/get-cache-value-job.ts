import { Logger } from '@/data/protocols/utils';
import { ErrorHandler, GetCacheValue } from '@/domain/usecases';
import { Job } from '@/job/protocols';

type ArgsType = {
  key: string;
  throws?: boolean;
  options?: { parseToJson: boolean; parseBufferToString?: boolean };
};

export class GetCacheValueJob implements Job {
  constructor(
    private readonly args: ArgsType,
    private readonly getCacheValue: GetCacheValue,
    private readonly logger: Logger,
    private readonly errorHandler: ErrorHandler
  ) {}
  async handle(
    _payload: Job.Payload,
    [state, setState]: Job.State,
    next: Job.Next
  ): Job.Result {
    try {
      const { key } = this.args;

      const value = await this.getCacheValue.get({
        key,
        throws: this.args.throws ?? false,
        options: {
          parseToJson: this.args.options?.parseToJson ?? false,
          parseBufferToString: this.args.options?.parseBufferToString ?? false
        }
      });

      setState({
        cacheValues: {
          ...state.cacheValues,
          [key]: value
        }
      });

      return next();
    } catch (error) {
      await this.errorHandler.handle(error);

      if (!this.args?.throws) return next();

      this.logger.log({
        level: 'error',
        message: `MISSING CACHE KEY: ${this.args.key}`,
        payload: { error }
      });
    }
  }
}
