import Fastify from 'fastify';

import { createMongoAgenda } from '@/infra/worker/create-mongo-agenda';
import { WORKER, logger } from '@/util';

const { BASE_URI, PORT } = WORKER.DASHBOARD;

const collection = 'agenda';

export type AgendaDashboard = {
  close(): Promise<void>;
};

export async function bootstrapAgendaDashboard(): Promise<AgendaDashboard> {
  const [{ createFastifyPlugin }, { agenda, mongoClient }] = await Promise.all([
    import('agendash'),
    createMongoAgenda(collection)
  ]);

  const fastify = Fastify();
  const middleware = createFastifyPlugin(agenda);

  fastify.register(middleware, { prefix: BASE_URI });
  try {
    await fastify.listen({ port: +PORT });
    logger.log(
      {
        level: 'info',
        message: `Agendash started at: http://127.0.0.1:${PORT}${BASE_URI}/`
      },
      'offline'
    );
  } catch (error) {
    await fastify.close().catch(() => undefined);
    await mongoClient.close();
    throw error;
  }

  return {
    async close() {
      try {
        await fastify.close();
      } finally {
        await mongoClient.close();
      }
    }
  };
}
