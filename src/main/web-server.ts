import path from 'path';

import { webServer as webServerFactory } from '@/infra/http/util/web-server';
import { elasticAPM } from '@/util';
import { SERVER } from '@/util/constants';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';

import {
  apmHttpLoggerMiddleware,
  dbHttpLoggerMiddleware,
  injectApmTransactionIdOnHeadersMiddleware
} from './middlewares';

elasticAPM();

const webServer = webServerFactory();

webServer.use(cors, {
  exposedHeaders: 'X-Total-Count'
});

webServer.socket({
  enabled: true,
  cors: {
    methods: ['GET', 'POST'],
    origin: '*'
  },
  transports: ['polling', 'websocket'],
  path: SERVER.SOCKET.HANDSHAKE_PATH
});

webServer.use(helmet);
webServer.use(apmHttpLoggerMiddleware);
webServer.use(dbHttpLoggerMiddleware);
webServer.use(injectApmTransactionIdOnHeadersMiddleware);

webServer.setBaseUrl(SERVER.BASE_URI);

const routesFolder = path.resolve(__dirname, 'routes');
const publicRoutesFolder = path.resolve(routesFolder, 'public');
const privateRoutesFolder = path.resolve(routesFolder, 'private');

webServer.routesDirectory(publicRoutesFolder);
webServer.routesDirectory(privateRoutesFolder);

export { webServer };
