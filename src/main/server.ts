import mongoose from 'mongoose';

import { sqlConnection } from '@/infra/db/mssql/util/connection';
import { logger } from '@/util';
import { MONGO, RABBIT, SERVER } from '@/util/constants';
import { rabbitMqServer } from '@/infra/mq/utils';

import { application } from './application';

application.onStart(async () => {
  try {
    const rabbitServer = rabbitMqServer();

    const rabbitPromise = rabbitServer
      .setCredentials({
        user: RABBIT.USER,
        password: RABBIT.PASSWORD,
        host: RABBIT.HOST,
        port: RABBIT.PORT
      })
      .setPrefetch(RABBIT.PREFETCH)
      .start();

    const mongoPromise = mongoose
      .set('strictQuery', false)
      .connect(MONGO.URL(), {
        dbName: MONGO.NAME,
        authSource: MONGO.AUTH_SOURCE,
        authMechanism: 'SCRAM-SHA-1'
      });

    const sqlPromise = sqlConnection.raw('SELECT 1');

    await Promise.all([mongoPromise, sqlPromise, rabbitPromise]);
  } catch (error) {
    logger.log(error);
    throw error;
  }
});

application.listenAsync(SERVER.PORT, () => {
  logger.log({
    level: 'info',
    message: `Server is running on port: ${SERVER.PORT}`
  });
});
