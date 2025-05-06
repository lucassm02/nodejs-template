import { Logger } from '@/data/protocols/util';
import { ErrorHandler, GetCacheValue } from '@/domain/usecases';
import { Job } from '@/job/protocols';
import { ExtractValues } from '@/plugin';

type ArgsType = {
  key: string;
  throws?: boolean;
  options?: { parseToJson: boolean; parseBufferToString?: boolean };
};

export class GetCacheValueJob extends ExtractValues implements Job {
  constructor(
    private readonly args: ArgsType,
    private readonly getCacheValue: GetCacheValue,
    private readonly logger: Logger,
    private readonly errorHandler: ErrorHandler,
    valuesToExtract: (string | Record<string, string>)[]
  ) {
    super(valuesToExtract);
  }

  async handle(
    payload: Job.Payload,
    [state, setState]: Job.State,
    next: Job.Next
  ): Job.Result {
    try {
      const extractValue = this.extractValuesFromSources({
        payload,
        state
      });

      const subKeyToBuffer = btoa(String(extractValue.subKey));
      const key = `${this.args.key}.${subKeyToBuffer}`;

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
