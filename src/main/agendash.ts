import Fastify from 'fastify';

import { MONGO, WORKER, logger } from '@/util';

const { BASE_URI, PORT } = WORKER.DASHBOARD;

const connection = `${MONGO.URL()}/${MONGO.NAME}?authSource=${MONGO.AUTH_SOURCE}`;
const collection = 'agenda';

async function bootstrapAgendaDashboard() {
  const [{ Agenda }, { MongoBackend }, { createFastifyPlugin }] =
    await Promise.all([
      import('agenda'),
      import('@agendajs/mongo-backend'),
      import('agendash')
    ]);

  const agenda = new Agenda({
    backend: new MongoBackend({
      address: connection,
      collection
    })
  });

  await agenda.ready;

  const fastify = Fastify();
  const middleware = createFastifyPlugin(agenda);

  fastify.register(middleware, { prefix: BASE_URI });
  fastify.listen({ port: +PORT }, (error) => {
    if (error) {
      logger.log(error);
      process.exit(1);
    }

    logger.log(
      {
        level: 'info',
        message: `Agendash started at: http://127.0.0.1:${PORT}${BASE_URI}/`
      },
      'offline'
    );
  });
}

bootstrapAgendaDashboard().catch((error) => {
  if (error instanceof Error) {
    logger.log(error);
  } else {
    logger.log(new Error(String(error)));
  }

  process.exit(1);
});
