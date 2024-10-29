import path from 'path';

import { workerManager } from '@/infra/worker';
import { logger } from '@/util';

import {
  checkDatabaseConnection,
  makeEvent,
  getMongooseConnection,
  getRabbitmqConnection
} from './util';

const event = makeEvent();

async function startWorker() {
  try {
    const manager = workerManager();

    const [mongoose, rabbitServer] = await Promise.all([
      getMongooseConnection(),
      getRabbitmqConnection(),
      checkDatabaseConnection(),
      manager.start()
    ]);

    const workersFolder = path.resolve(__dirname, 'workers');

    manager.tasksDirectory(workersFolder);

    async function gracefulShutdown() {
      try {
        logger.log({
          level: 'info',
          message: 'Consumer interrupted'
        });

        setImmediate(async () => {
          try {
            await manager.stop();

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

startWorker();
