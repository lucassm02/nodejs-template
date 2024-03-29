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
      const { subKey, ...value } = extractValue;

      const params = this.args.ttl
        ? { key, subKey, value, ttl: this.args.ttl }
        : { key, subKey, value };

      await this.saveInCache.save(params);

      return next();
    } catch (error) {
      await this.errorHandler.handle(error);

      if (!this.args?.throws) return next();

      return serverError(error);
    }
  }
}
