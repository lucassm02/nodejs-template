import { logger } from '@/util';
import { SERVER } from '@/util/constants';

import { application } from './application';
import {
  checkDatabaseConnection,
  eventHandler,
  getMongooseConnection,
  getRabbitmqConnection
} from './util';

async function startServer() {
  try {
    const event = eventHandler();

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

        application.close();
        logger.log({
          level: 'info',
          message: 'Server interrupted.'
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
    logger.log(error);
    throw error;
  }
}

startServer();
