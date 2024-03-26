import path from 'path';

import { httpServer } from '@/infra/http/utils/http-server';
import { elasticAPM } from '@/util';
import { SERVER } from '@/util/constants';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';

import { apmHttpLoggerMiddleware, dbHttpLoggerMiddleware } from './middlewares';

elasticAPM();
const application = httpServer();

application.use(cors, {
  exposedHeaders: 'X-Total-Count'
});
application.use(helmet);
application.use(apmHttpLoggerMiddleware);
application.use(dbHttpLoggerMiddleware);

application.setBaseUrl(SERVER.BASE_URI);

const routesFolder = path.resolve(__dirname, 'routes');
const publicRoutesFolder = path.resolve(routesFolder, 'public');
const privateRoutesFolder = path.resolve(routesFolder, 'private');

application.routesDirectory(publicRoutesFolder);
application.routesDirectory(privateRoutesFolder);

export { application };
