import { ErrorHandler, SaveInCache } from '@/domain/usecases';
import { Job } from '@/job/protocols';
import { ExtractValues } from '@/plugin';

type ArgsType = {
  key: string;
  throws?: boolean;
  ttl?: number;
};

export class SaveInCacheJob extends ExtractValues implements Job {
  constructor(
    private readonly args: ArgsType,
    private readonly errorHandler: ErrorHandler,
    private readonly saveInCache: SaveInCache,
    valuesToExtract: (string | Record<string, string>)[]
  ) {
    super(valuesToExtract);
  }
  async handle(
    payload: Job.Payload,
    [state]: Job.State,
    next: Job.Next
  ): Job.Result {
    try {
      const extractValue = this.extractValuesFromSources({
        payload,
        state
      });

      const { key } = this.args;

      const params = this.args.ttl
        ? { key, value: extractValue, ttl: this.args.ttl }
        : { key, value: extractValue };

      await this.saveInCache.save(params);

      return next();
    } catch (error) {
      await this.errorHandler.handle(error);
      if (!this.args?.throws) return next();
    }
  }
}
