import { sqlConnection } from '@/infra/db/mssql/util';
import { rabbitMqServer } from '@/infra/mq/utils';
import { consumersSetup } from '@/main/configs/consumers';
import { logger, MONGO, RABBIT } from '@/util';
import mongoose from 'mongoose';

(async () => {
  try {
    const rabbitServer = rabbitMqServer();

    const rabbitPromise = rabbitServer
      .setCredentials({
        user: RABBIT.USER,
        password: RABBIT.PASSWORD,
        host: RABBIT.HOST,
        port: RABBIT.PORT,
      })
      .setPrefetch(RABBIT.PREFETCH)
      .start();

    const mongoPromise = mongoose
      .set('strictQuery', false)
      .connect(MONGO.URL(), {
        dbName: MONGO.NAME,
        authSource: MONGO.AUTH_SOURCE,
        authMechanism: 'SCRAM-SHA-1',
      });

    const sqlPromise = sqlConnection.raw('SELECT 1');

    await Promise.all([rabbitPromise, mongoPromise, sqlPromise]);

    consumersSetup(rabbitServer);
    logger.log({ level: 'info', message: 'Consumer started!' });
  } catch (error) {
    logger.log(error);
  }
})();
