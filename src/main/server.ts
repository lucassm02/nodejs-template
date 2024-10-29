import { logger } from '@/util';
import { SERVER } from '@/util/constants';

import { application } from './application';
import {
  checkDatabaseConnection,
  makeEvent,
  getMongooseConnection,
  getRabbitmqConnection
} from './util';

async function startServer() {
  try {
    const event = makeEvent();

    const [mongoose, rabbitServer] = await Promise.all([
      getMongooseConnection(),
      getRabbitmqConnection(),
      checkDatabaseConnection()
    ]);

    application.listen(SERVER.PORT, () => {
      logger.log({
        level: 'info',
        message: `Server is running on port: ${SERVER.PORT}`
      });
    });

    async function gracefulShutdown() {
      try {
        await application.close();
        logger.log({
          level: 'info',
          message: 'Server interrupted'
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
    logger.log(error);
    throw error;
  }
}

startServer();
