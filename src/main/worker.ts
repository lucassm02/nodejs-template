import path from 'path';

import { workerManager } from '@/infra/worker';
import { logger } from '@/util';

import {
  checkDatabaseConnection,
  eventHandler,
  getMongooseConnection
} from './util';

const event = eventHandler();

async function startWorker() {
  try {
    const manager = workerManager();

    const [mongoose] = await Promise.all([
      getMongooseConnection(),
      checkDatabaseConnection(),
      manager.start()
    ]);

    const workersFolder = path.resolve(__dirname, 'workers');

    manager.tasksDirectory(workersFolder);

    async function gracefulShutdown() {
      try {
        if (mongoose) {
          await mongoose.disconnect();
          logger.log({
            level: 'info',
            message: 'Mongoose connection disconnected.'
          });
        }

        await manager.stop();

        logger.log({
          level: 'info',
          message: 'Worker interrupted.'
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

startWorker();
