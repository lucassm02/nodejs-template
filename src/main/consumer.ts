import path from 'path';

import { logger } from '@/util';

import {
  checkDatabaseConnection,
  makeEvent,
  getMongooseConnection,
  getRabbitmqConnection
} from './util';

async function startConsumer() {
  try {
    const event = makeEvent();

    const [rabbitServer, mongoose] = await Promise.all([
      getRabbitmqConnection(),
      getMongooseConnection(),
      checkDatabaseConnection()
    ]);

    const consumersFolder = path.resolve(__dirname, 'consumers');

    rabbitServer.consumersDirectory(consumersFolder);

    logger.log({ level: 'info', message: 'Consumer started' });

    async function gracefulShutdown() {
      try {
        rabbitServer.cancelConsumers();

        logger.log({
          level: 'info',
          message: 'Consumer interrupted'
        });

        setImmediate(async () => {
          try {
            await rabbitServer.stop();
            logger.log({
              level: 'info',
              message: 'RabbitMq connection closed'
            });

            await mongoose.disconnect();
            logger.log(
              {
                level: 'info',
                message: 'Mongoose connection closed'
              },
              'offline'
            );
          } catch (error) {
            logger.log(error, 'offline');
          } finally {
            event.emit('exit');
          }
        });
      } catch (error) {
        logger.log(error);
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
