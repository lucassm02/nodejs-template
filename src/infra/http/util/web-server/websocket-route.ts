import { SocketHandler } from './socket-handler';
import type { RouteMiddlewareSocket } from './types';

type ConnectionEvents =
  | 'error'
  | 'upgrade'
  | 'message'
  | 'open'
  | 'ping'
  | 'close';

export interface WebSocketMethods {
  open(...middlewares: RouteMiddlewareSocket[]): void;
  error(...middlewares: RouteMiddlewareSocket[]): void;
  upgrade(...middlewares: RouteMiddlewareSocket[]): void;
  message(...middlewares: RouteMiddlewareSocket[]): void;
  close(...middlewares: RouteMiddlewareSocket[]): void;
  ping(...middlewares: RouteMiddlewareSocket[]): void;
  on(event: string, ...middlewares: RouteMiddlewareSocket[]): void;
}

const ALLOWED_WEBSOCKET_CONNECTION_EVENTS: ConnectionEvents[] = [
  'close',
  'error',
  'message',
  'open',
  'ping',
  'upgrade'
];

export class WebsocketRoute {
  private constructor() {}

  static getInstance(): WebsocketRoute {
    return new WebsocketRoute();
  }

  static ws(): WebSocketMethods {
    const allowedMethods: {
      [k in ConnectionEvents]?: (
        ...middlewares: RouteMiddlewareSocket[]
      ) => void;
    } & {
      on: (event: string, ...middlewares: RouteMiddlewareSocket[]) => void;
    } = {
      on: (event: string, ...middlewares: RouteMiddlewareSocket[]) => {
        SocketHandler.on(event, ...middlewares);
      }
    };

    for (const method of ALLOWED_WEBSOCKET_CONNECTION_EVENTS) {
      allowedMethods[method] = (...middlewares: RouteMiddlewareSocket[]) => {
        SocketHandler[method](...middlewares);
      };
    }

    return <WebSocketMethods>allowedMethods;
  }
}
