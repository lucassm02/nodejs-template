import { FastifyRequest } from 'fastify';
import { Socket } from 'socket.io';

import { httpServer } from '@/infra/http/utils/http-server';
import {
  EVENT_KEY,
  REQUEST_KEY,
  SOCKET_KEY,
  STATE_KEY,
  type RouteMiddlewareSocket
} from '@/infra/http/utils/http-server/types';
import makeFlow from '@/main/adapters/flow-adapter';

export const httpWebsocketAdapter = (...args: RouteMiddlewareSocket[]) => {
  return async (
    request: FastifyRequest,
    response: Socket,
    finish: Function,
    [state]: [Record<string, unknown>, Function]
  ) => {
    const server = httpServer().getWebsocketServer();

    const event = request[EVENT_KEY];

    const middlewares = args.map((middleware) => {
      return server.adapter(middleware, event);
    });

    await makeFlow({
      [REQUEST_KEY]: request,
      [STATE_KEY]: state,
      [SOCKET_KEY]: response
    })(...middlewares)();

    if (response.disconnected) return;

    return finish();
  };
};
