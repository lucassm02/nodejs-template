import { HttpServer } from '@/infra/http/utils/http-server';
import { httpLoggerAdapter } from '@/main/adapters';
import { SERVER } from '@/util/constants';
import { ElasticAPM } from '@/util/observability/apm';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import path from 'path';

import { createHttpRequestLog } from './facades/create-http-request-log';

const application = HttpServer.getInstance();

ElasticAPM.getInstance();

application.use(cors({ exposedHeaders: 'X-Total-Count' }));
application.use(helmet());
application.use(express.json());
application.use(express.urlencoded({ extended: true }));
application.use(httpLoggerAdapter(createHttpRequestLog));

application.setSharedState({});

application.setBaseUrl(SERVER.BASE_URI);

const routesFolder = path.resolve(__dirname, 'routes');
const publicRoutesFolder = path.resolve(routesFolder, 'public');
const privateRotesFolder = path.resolve(routesFolder, 'private');

application.routesDirectory(publicRoutesFolder);
application.routesDirectory(privateRotesFolder);

export { application };
