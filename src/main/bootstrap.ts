import path from 'path';

import knexSetup from '@/infra/db/mssql/util/knex';
import { WorkerManager, workerManager } from '@/infra/worker';
import {
  CONSUMER,
  MEMCACHED,
  RABBIT,
  SERVER,
  WORKER,
  elasticAPM,
  logger
} from '@/util';
import { makeCacheServer } from '@/infra/cache';
import { RabbitMqServer } from '@/infra/mq/utils';

import { getArgs } from './cli';
import {
  checkDatabaseConnection,
  getMongooseConnection,
  getRabbitmqConnection,
  setMemcachedConnection
} from './util';
import { webServer } from './web-server';

knexSetup();

const { server, consumer, dashboard, worker } = getArgs();

const ENABLED_SERVICES = {
  SERVER: server ?? SERVER.ENABLED,
  CONSUMER: consumer ?? CONSUMER.ENABLED,
  WORKER: worker ?? WORKER.ENABLED,
  DASHBOARD: dashboard ?? WORKER.DASHBOARD.ENABLED,
  MEMCACHED: MEMCACHED.ENABLED
};

const SHUTDOWN_TIMEOUT = 30_000;

export async function bootstrap() {
  elasticAPM();

  if (Object.values(ENABLED_SERVICES).every((item) => item === false)) {
    logger.log(
      {
        level: 'warn',
        message: 'No service enabled, exiting...'
      },
      'offline'
    );

    process.exit(0);
  }

  const [mongoose] = await Promise.all([
    getMongooseConnection(),
    checkDatabaseConnection()
  ]);

  let rabbitServer: RabbitMqServer | null = null;
  let worker: WorkerManager | null = null;

  if (RABBIT.ENABLED) {
    rabbitServer = await getRabbitmqConnection();
  }

  if (rabbitServer && ENABLED_SERVICES.CONSUMER) {
    const consumersFolder = path.resolve(__dirname, 'consumers');
    rabbitServer.consumersDirectory(consumersFolder);
    logger.log({ level: 'info', message: 'Consumer started' });
  }

  if (ENABLED_SERVICES.SERVER) {
    await webServer.listen(SERVER.PORT);

    logger.log({
      level: 'info',
      message: `Server is running on port: ${SERVER.PORT}`
    });
  }

  if (ENABLED_SERVICES.WORKER) {
    worker = workerManager();
    worker.start();
    const workersFolder = path.resolve(__dirname, 'workers');
    worker.tasksDirectory(workersFolder);
  }

  if (ENABLED_SERVICES.DASHBOARD) {
    await import('./agendash');
  }

  if (MEMCACHED.ENABLED) {
    setMemcachedConnection();
    makeCacheServer().connect();
    logger.log({ level: 'info', message: 'Memcached started!' });
  }

  async function gracefulShutdown() {
    try {
      setTimeout(() => {
        process.exit(0);
      }, SHUTDOWN_TIMEOUT);

      if (String(process.env.NODE_ENV).toUpperCase() !== 'PRODUCTION') {
        process.exit(0);
      }

      if (ENABLED_SERVICES.SERVER) {
        await webServer.close();
        logger.log({
          level: 'info',
          message: 'Server interrupted'
        });
      }

      if (worker) {
        await worker.stop();
      }

      if (rabbitServer) {
        await rabbitServer.stop();
      }

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

      makeCacheServer().disconnect();
      logger.log({
        level: 'info',
        message: 'Memcached connection closed'
      });

      process.exit(0);
    } catch (error) {
      logger.log(error);
      process.exit(1);
    }
  }

  process.on('SIGINT', gracefulShutdown);
  process.on('SIGTERM', gracefulShutdown);
}
