import { FastifyReply, FastifyRequest } from 'fastify';

import { httpServer } from '@/infra/http/utils/http-server';
import {
  REPLY_KEY,
  REQUEST_KEY,
  RouteMiddleware,
  STATE_KEY
} from '@/infra/http/utils/http-server/types';
import makeFlow from '@/main/adapters/flow-adapter';

export const httpAdapter = (...args: RouteMiddleware[]) => {
  return async (
    request: FastifyRequest,
    response: FastifyReply,
    finish: Function,
    state: [Record<string, unknown>, Function]
  ) => {
    const server = httpServer();

    const middlewares = args.map((middleware) => {
      return server.adapter(middleware);
    });

    await makeFlow({
      [REQUEST_KEY]: request,
      [STATE_KEY]: state,
      [REPLY_KEY]: response
    })(...middlewares)();

    if (response.sent) return;

    return finish();
  };
};
