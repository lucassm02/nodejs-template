import type { FastifyRequest } from 'fastify';
import { Socket } from 'socket.io';

import { webServer } from '@/infra/http/util';
import {
  EVENT_KEY,
  REQUEST_KEY,
  SOCKET_KEY,
  STATE_KEY,
  type RouteMiddlewareSocket
} from '@/infra/http/util/web-server/types';
import makeFlow from '@/main/adapters/flow-adapter';
import { logger } from '@/util';

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

    const server = webServer().getWebsocketServer();

    const repeater = setInterval(() => {
      const event = request[EVENT_KEY];

      const middlewares = args.map((middleware) => {
        return server.adapter(middleware, event);
      });

      makeFlow({
        [REQUEST_KEY]: request,
        [STATE_KEY]: state,
        [SOCKET_KEY]: socket
      })(...middlewares)()
        .then(() => {
          if (socket.disconnected) clearAll();
        })
        .catch((error) => {
          clearAll();
          logger.log({
            level: 'error',
            message: 'Timed repeater error',
            error
          });
        });
    }, each);

    const timer = setTimeout(() => {
      socket.disconnect();
      clearAll();
    }, timeout);
  };
};
