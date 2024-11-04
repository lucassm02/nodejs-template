import type { Server } from 'http';

import {
  WebSocketServer,
  type WebSocketServerOptions
} from './websocket-server';

export const makeWebsocketServer = (
  server: Server,
  options: WebSocketServerOptions
) => {
  return WebSocketServer.getInstance(server, options);
};
