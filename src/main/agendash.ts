import { Agenda } from 'agenda';
import agendash from 'agendash';
import Fastify from 'fastify';

import { MONGO, WORKER, logger } from '@/util';

const { BASE_URI, PORT } = WORKER.DASHBOARD;

const connection = `${MONGO.URL()}/${MONGO.NAME}?authSource=${MONGO.AUTH_SOURCE}`;
const collection = 'agenda';

const agenda = new Agenda().database(connection, collection);

const fastify = Fastify();

const middleware = agendash(agenda, {
  title: 'Agenda Dashboard',
  middleware: 'fastify'
});

fastify.register(middleware, { prefix: BASE_URI });
fastify.listen({ port: +PORT }, (error) => {
  if (error) {
    logger.log(error);
    process.exit(1);
  }

  logger.log(
    {
      level: 'info',
      message: `Agendash started http://localhost:${PORT}${BASE_URI}`
    },
    'offline'
  );
});
