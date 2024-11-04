import path from 'path';

import knexSetup from '@/infra/db/mssql/util/knex';
import { workerManager } from '@/infra/worker';
import { CONSUMER, SERVER, WORKER, logger } from '@/util';

import {
  checkDatabaseConnection,
  getMongooseConnection,
  getRabbitmqConnection
} from './util';
import { webServer } from './web-server';

knexSetup();

const servicesEnabledValue = [
  CONSUMER.ENABLED,
  SERVER.ENABLED,
  WORKER.ENABLED,
  WORKER.DASHBOARD.ENABLED
];

const SHUTDOWN_TIMEOUT = 30_000;

export async function bootstrap() {
  if (servicesEnabledValue.every((item) => item === false)) {
    logger.log(
      {
        level: 'warn',
        message: 'No service enabled, exiting...'
      },
      'offline'
    );

    process.exit(0);
  }

  const [rabbitServer, mongoose] = await Promise.all([
    getRabbitmqConnection(),
    getMongooseConnection(),
    checkDatabaseConnection()
  ]);

  const worker = workerManager();

  if (CONSUMER.ENABLED) {
    const consumersFolder = path.resolve(__dirname, 'consumers');
    rabbitServer.consumersDirectory(consumersFolder);
    logger.log({ level: 'info', message: 'Consumer started' });
  }

  if (SERVER.ENABLED) {
    await webServer.listen(SERVER.PORT);

    logger.log({
      level: 'info',
      message: `Server is running on port: ${SERVER.PORT}`
    });
  }

  if (WORKER.ENABLED) {
    worker.start();
    const workersFolder = path.resolve(__dirname, 'workers');
    worker.tasksDirectory(workersFolder);
  }

  if (WORKER.DASHBOARD.ENABLED) {
    await import('./agendash');
  }

  async function gracefulShutdown() {
    try {
      setTimeout(() => {
        process.exit(0);
      }, SHUTDOWN_TIMEOUT);

      if (String(process.env.NODE_ENV).toUpperCase() !== 'PRODUCTION') {
        process.exit(0);
      }

      if (SERVER.ENABLED) {
        await webServer.close();
        logger.log({
          level: 'info',
          message: 'Server interrupted'
        });
      }

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
      process.exit(0);
    } catch (error) {
      logger.log(error);
      process.exit(1);
    }
  }

  process.on('SIGINT', gracefulShutdown);
  process.on('SIGTERM', gracefulShutdown);
}
