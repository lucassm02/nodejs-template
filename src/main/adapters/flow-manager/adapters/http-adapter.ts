import { httpServer } from '@/infra/http/utils/http-server';
import makeFlow from '@/main/adapters/fow-adapter';

type Payload = {
  state: Record<string, unknown>;
  request: Record<string, unknown>;
  response: Record<string, unknown>;
};

export const httpAdapter = (...args: (Function | { handle: Function })[]) => {
  return async (
    request: Record<string, unknown>,
    response: Record<string, unknown>,
    finish: Function,
    state: [Record<string, unknown>, Function]
  ) => {
    const server = httpServer();

    const middlewares = args.map((middleware) => {
      return ({ state, request, response }: Payload, next: Function) => {
        if (typeof middleware === 'function')
          return middleware(request, response, next, state);

        // TODO: Change typology
        return server.adapter(<any>middleware)(
          <any>request,
          <any>response,
          <any>next
        );
      };
    });

    await makeFlow({ state, request, response })(...middlewares)();
    if (response.headersSent) return;
    return finish();
  };
};
