import fastify from 'fastify';

import { WebServer } from './web-server';

export function webServer(getInstance = true) {
  if (getInstance) return WebServer.getInstance();
  return new WebServer(fastify);
}
