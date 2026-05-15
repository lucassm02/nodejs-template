import { Middleware } from '@/presentation/protocols';

interface Handler {
  handle(...args: unknown[]): Promise<unknown>;
}

type HandlerOrFunction = Handler | Function;

export type ParallelizeMode =
  | 'allSettled' // all run, always advances — failures are ignored
  | 'all' // all run, advances only if all succeed — first failure stops the flow
  | 'race' // advances/fails as soon as any handler completes (success or failure)
  | 'any'; // advances as soon as any handler succeeds — fails only if all fail

export type ParallelizeOptions = {
  mode?: ParallelizeMode;
};

export enum ParallelizeExceptions {
  NOT_FOUND_NEXT = 'The args provided should contains next function as parameter'
}

function isParallelizeOptions(
  arg: HandlerOrFunction | ParallelizeOptions
): arg is ParallelizeOptions {
  return typeof arg !== 'function' && !('handle' in (arg as object));
}

function resolveByMode(
  promises: Promise<unknown>[],
  mode: ParallelizeMode
): Promise<unknown> {
  switch (mode) {
    case 'all':
      return Promise.all(promises);
    case 'race':
      return Promise.race(promises);
    case 'any':
      return Promise.any(promises);
    case 'allSettled':
    default:
      return Promise.allSettled(promises);
  }
}

export function parallelize(
  options: ParallelizeOptions,
  handler: HandlerOrFunction,
  ...handlers: HandlerOrFunction[]
): Function;
export function parallelize(
  handler: HandlerOrFunction,
  ...handlers: HandlerOrFunction[]
): Function;
export function parallelize(
  arg1: ParallelizeOptions | HandlerOrFunction,
  ...rest: HandlerOrFunction[]
) {
  const hasOptions = isParallelizeOptions(arg1);
  const options: ParallelizeOptions = hasOptions ? arg1 : {};
  const toResolveMiddlewares: HandlerOrFunction[] = hasOptions
    ? rest
    : [arg1 as HandlerOrFunction, ...rest];

  const mode: ParallelizeMode = options.mode ?? 'allSettled';

  return async (...args: unknown[]) => {
    const next = <Middleware.Next>args.find((arg) => typeof arg === 'function');
    const stateHook = args.find((arg) => Array.isArray(arg));

    if (!next) throw new Error(ParallelizeExceptions.NOT_FOUND_NEXT);

    const indexOfPayload = 0;
    const indexOfNext = args.indexOf(next);
    const indexOfStatehook = args.indexOf(stateHook);

    const noop = () => {};
    args[indexOfNext] = noop;

    const promises = toResolveMiddlewares.map((handler) => {
      if (typeof handler === 'function') return handler(...args);
      return handler.handle(args[indexOfPayload], args[indexOfStatehook], noop);
    });

    await resolveByMode(promises, mode);

    return next();
  };
}
