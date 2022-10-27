import makeFlow from '@/main/adapters/fow-adapter';

export const httpAdapter = (...args: (Function | { handle: Function })[]) => {
  return async (
    request: Record<string, unknown>,
    response: Record<string, unknown>,
    finish: Function,
    state: [Record<string, unknown>, Function]
  ) => {
    type Payload = {
      state: Record<string, unknown>;
      request: Record<string, unknown>;
      response: Record<string, unknown>;
    };

    const middlewares = args.map((middleware) => {
      return ({ state, request, response }: Payload, next: Function) => {
        if (typeof middleware === 'function')
          return middleware(request, response, next, state);

        return middleware.handle(request, response, state, next);
      };
    });

    await makeFlow({ state, request, response })(...middlewares)();
    if (response.headersSent) return;
    return finish();
  };
};
