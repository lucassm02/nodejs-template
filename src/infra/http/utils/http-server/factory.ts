import { HttpServer } from './http-server';

export function httpServer(getInstance = true) {
  if (getInstance) return HttpServer.getInstance();
  return new HttpServer();
}
