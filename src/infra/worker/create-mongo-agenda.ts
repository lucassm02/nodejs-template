import type { Agenda as AgendaInstance } from 'agenda';
import type { MongoClient } from 'mongodb';

import { MONGO } from '@/util';

export type MongoAgenda = {
  agenda: AgendaInstance;
  mongoClient: MongoClient;
};

export async function createMongoAgenda(
  collection: string
): Promise<MongoAgenda> {
  const [{ Agenda }, { MongoBackend, MongoClient }] = await Promise.all([
    import('agenda'),
    // eslint-disable-next-line import/no-extraneous-dependencies
    import('@agendajs/mongo-backend')
  ]);
  const mongoUrl = `${MONGO.URL()}/${MONGO.NAME}?authSource=${
    MONGO.AUTH_SOURCE
  }`;
  const mongoClient = new MongoClient(mongoUrl, {
    serverSelectionTimeoutMS: MONGO.CONNECTION_TIMEOUT_MS,
    socketTimeoutMS: MONGO.CONNECTION_TIMEOUT_MS,
    connectTimeoutMS: MONGO.CONNECTION_TIMEOUT_MS,
    maxPoolSize: MONGO.MAX_POOL_SIZE,
    minPoolSize: MONGO.MIN_POOL_SIZE
  });

  try {
    await mongoClient.connect();

    const backend = new MongoBackend({
      mongo: mongoClient.db(MONGO.NAME),
      collection
    });

    // Agenda 6.2.5 does not reject `ready` when backend.connect() fails.
    // Initialize it explicitly so connection/index errors reach the caller.
    await backend.connect();
    backend.connect = async () => undefined;

    return {
      agenda: new Agenda({ backend }),
      mongoClient
    };
  } catch (error) {
    await mongoClient.close().catch(() => undefined);
    throw error;
  }
}
