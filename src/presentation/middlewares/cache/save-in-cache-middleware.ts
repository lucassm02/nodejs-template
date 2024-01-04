import { Logger } from '@/data/protocols/utils';
import { ErrorHandler, SaveInCache } from '@/domain/usecases';
import { ExtractValues } from '@/plugin';
import { Middleware } from '@/presentation/protocols';
import { serverError } from '@/presentation/utils';

type ArgsType = {
  key: string;
  throws?: boolean;
  ttl?: number;
};

export class SaveInCacheMiddleware extends ExtractValues implements Middleware {
  constructor(
    private readonly args: ArgsType,
    private readonly errorHandler: ErrorHandler,
    private readonly saveInCache: SaveInCache,
    valuesToExtract: (string | Record<string, string>)[]
  ) {
    super(valuesToExtract);
  }
  async handle(
    httpRequest: Middleware.HttpRequest,
    [state]: Middleware.State,
    next: Middleware.Next
  ): Middleware.Result {
    try {
      const extractValue = this.extractValuesFromSources({
        request: httpRequest,
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

      switch (error.message) {
        case SaveInCache.Exceptions.ERROR_ON_SAVE_IN_CACHE:
          return serverError(error);
        default:
          return serverError(error);
      }
    }
  }
}
