import type { FastifyRequest } from 'fastify';
import { Socket } from 'socket.io';

import { httpServer } from '@/infra/http/utils';
import {
  EVENT_KEY,
  REQUEST_KEY,
  SOCKET_KEY,
  STATE_KEY,
  type RouteMiddlewareSocket
} from '@/infra/http/utils/http-server/types';
import makeFlow from '@/main/adapters/flow-adapter';

type Options = {
  each: number;
  timeout: number;
};
export const useTimedRepeater = (
  { each, timeout }: Options,
  ...args: RouteMiddlewareSocket[]
) => {
  return async (
    socket: Socket,
    request: FastifyRequest,
    finish: Function,
    [state]: [Record<string, unknown>, Function]
  ) => {
    const clearAll = () => {
      clearTimeout(timer);
      clearInterval(repeater);
      return finish();
    };

    const repeater = setInterval(async () => {
      const server = httpServer().getWebsocketServer();

      const event = request[EVENT_KEY];

      const middlewares = args.map((middleware) => {
        return server.adapter(middleware, event);
      });

      await makeFlow({
        [REQUEST_KEY]: request,
        [STATE_KEY]: state,
        [SOCKET_KEY]: socket
      })(...middlewares)();

      if (socket.disconnected) {
        return clearAll();
      }
    }, each);

    const timer = setTimeout(() => {
      socket.disconnect();
      clearAll();
    }, timeout);
  };
};
