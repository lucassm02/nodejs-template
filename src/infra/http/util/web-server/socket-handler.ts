import type {
  RouteMiddlewareSocket,
  SocketHandlersCallbacks,
  WebSocketCallbackMetadata
} from './types';

export interface WebSocketMethods {
  open(...middlewares: RouteMiddlewareSocket[]): void;
  error(...middlewares: RouteMiddlewareSocket[]): void;
  upgrade(...middlewares: RouteMiddlewareSocket[]): void;
  message(...middlewares: RouteMiddlewareSocket[]): void;
  close(...middlewares: RouteMiddlewareSocket[]): void;
  ping(...middlewares: RouteMiddlewareSocket[]): void;
  on(event: string | symbol, ...middlewares: RouteMiddlewareSocket[]): void;
}

export class SocketHandler {
  private static socketHandlerCallbacks: SocketHandlersCallbacks = new Map();

  private constructor() {}

  static on(method: string, ...middlewares: RouteMiddlewareSocket[]): void {
    this.setSocketHandlersCallbacks({
      middlewares,
      method
    });
  }

  static open(...middlewares: RouteMiddlewareSocket[]): void {
    this.setSocketHandlersCallbacks({
      middlewares,
      method: 'open'
    });
  }
  static error(...middlewares: RouteMiddlewareSocket[]): void {
    this.setSocketHandlersCallbacks({
      middlewares,
      method: 'error'
    });
  }
  static upgrade(...middlewares: RouteMiddlewareSocket[]): void {
    this.setSocketHandlersCallbacks({
      middlewares,
      method: 'upgrade'
    });
  }
  static message(...middlewares: RouteMiddlewareSocket[]): void {
    this.setSocketHandlersCallbacks({
      middlewares,
      method: 'message'
    });
  }
  static close(...middlewares: RouteMiddlewareSocket[]): void {
    this.setSocketHandlersCallbacks({
      middlewares,
      method: 'close'
    });
  }
  static ping(...middlewares: RouteMiddlewareSocket[]): void {
    this.setSocketHandlersCallbacks({
      middlewares,
      method: 'ping'
    });
  }

  private static setSocketHandlersCallbacks(
    params: WebSocketCallbackMetadata
  ): void {
    const { method, middlewares } = params;

    const socketHandlers = this.socketHandlerCallbacks.get(method);

    if (!socketHandlers) {
      this.socketHandlerCallbacks.set(method, {
        method,
        middlewares
      });
    }
  }

  public static getSocketHandlersCallbacks(): SocketHandlersCallbacks {
    return this.socketHandlerCallbacks;
  }
}
