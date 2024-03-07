import { Middleware } from '@/presentation/protocols';

interface Handler {
  handle: (...args: unknown[]) => Promise<void>;
}

type HandlerOrFunction = Handler | Function;

export enum ParallelizeExceptions {
  NOT_FOUND_NEXT = 'The args provided should contains next function as parameter'
}

export function parallelize(
  handler: HandlerOrFunction,
  ...handlers: HandlerOrFunction[]
) {
  return async (...args: unknown[]) => {
    const next = <Middleware.Next>args.find((arg) => typeof arg === 'function');

    if (!next) throw new Error(ParallelizeExceptions.NOT_FOUND_NEXT);

    const indexOfNext = args.indexOf(next);

    const toResolveMiddlewares = [handler, ...handlers];

    const decoratedNext = function (limit: number) {
      let counter = 0;
      return function () {
        counter += 1;
        if (counter === limit) next();
      };
    };

    args[indexOfNext] = decoratedNext(toResolveMiddlewares.length);

    const promises = toResolveMiddlewares.map((handler) => {
      if (typeof handler === 'function') return handler(...args);
      return handler.handle(...args);
    });

    await Promise.allSettled(promises);

    return next();
  };
}
