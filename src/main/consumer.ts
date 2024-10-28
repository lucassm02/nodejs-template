import path from 'path';

import { logger } from '@/util';

import {
  checkDatabaseConnection,
  eventHandler,
  getMongooseConnection,
  getRabbitmqConnection
} from './util';

async function startConsumer() {
  try {
    const event = eventHandler();

    const [rabbitServer, mongoose] = await Promise.all([
      getRabbitmqConnection(),
      getMongooseConnection(),
      checkDatabaseConnection()
    ]);

    const consumersFolder = path.resolve(__dirname, 'consumers');

    rabbitServer.consumersDirectory(consumersFolder);

    logger.log({ level: 'info', message: 'Consumer started!' });

    async function gracefulShutdown() {
      try {
        if (rabbitServer) {
          await rabbitServer.close();
          logger.log({
            level: 'info',
            message: 'RabbitMq connection closed.'
          });
        }
        if (mongoose) {
          await mongoose.disconnect();
          logger.log({
            level: 'info',
            message: 'Mongoose connection closed.'
          });
        }

        logger.log({
          level: 'info',
          message: 'Consumer interrupted.'
        });
      } catch (error) {
        logger.log(error, 'offline');
      } finally {
        event.emit('exit');
      }
    }

    process.on('SIGINT', gracefulShutdown);
    process.on('SIGTERM', gracefulShutdown);
  } catch (error) {
    logger.log(error, 'offline');
    throw error;
  }
}

startConsumer();
