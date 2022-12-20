import { sqlConnection } from '@/infra/db/mssql/util';
import { rabbitMqServer } from '@/infra/mq/utils';
import { consumersSetup } from '@/main/configs/consumers';
import { logger, MONGO, RABBIT } from '@/util';
import mongoose from 'mongoose';

(async () => {
  try {
    mongoose.set('strictQuery', false);

    await mongoose.connect(MONGO.URL(), {
      dbName: MONGO.NAME,
      authSource: MONGO.AUTH_SOURCE,
      authMechanism: 'SCRAM-SHA-1',
    });

    const server = rabbitMqServer();

    server.setCredentials({
      user: RABBIT.USER,
      password: RABBIT.PASSWORD,
      host: RABBIT.HOST,
      port: +RABBIT.PORT,
    });

    await sqlConnection.raw('SELECT 1');

    await server.start();

    consumersSetup(server);
    logger.log({ level: 'info', message: 'Consumer started!' });
  } catch (error) {
    logger.log(error);
  }
})();
