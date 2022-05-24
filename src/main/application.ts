import { HttpServer } from '@/infra/http/utils/http-server';
import { httpLoggerAdapter } from '@/main/adapters';
import { SERVER } from '@/util/constants';
import { ElasticAPM } from '@/util/observability/apm';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';

import { enableRoutes } from './configs';
import { createHttpRequestLog } from './facades/create-http-request-log';

const server = HttpServer.getInstance();

ElasticAPM.getInstance();

server.use(cors({ exposedHeaders: 'X-Total-Count' }));
server.use(helmet());
server.use(express.json());
server.use(express.urlencoded({ extended: true }));
server.use(httpLoggerAdapter(createHttpRequestLog));

server.setSharedState({});

server.baseUrl(SERVER.BASE_URI);

enableRoutes('public');
enableRoutes('private');

export { server };
