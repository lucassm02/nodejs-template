import path from 'path';
import { Mongoose } from 'mongoose';

import { CacheServer } from '@/infra/cache/cache-server';
import knexSetup from '@/infra/db/mssql/util/knex';
import { RabbitMqServer } from '@/infra/mq/utils';
import { WorkerManager, workerManager } from '@/infra/worker';
import {
  CONSUMER,
  DB,
  MEMCACHED,
  MONGO,
  RABBIT,
  SERVER,
  WORKER,
  elasticAPM,
  logger,
  splitPromises
} from '@/util';

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
  try {
    elasticAPM();

    const promises: Array<() => Promise<unknown>> = [];

    let rabbitServer: RabbitMqServer | null = null;
    let worker: WorkerManager | null = null;
    let cacheServer: CacheServer | null = null;
    let mongoose: Mongoose | null = null;

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

    async function connectToSQL() {
      await checkDatabaseConnection();

      logger.log({
        level: 'info',
        message: `SQL connection checked!`
      });
    }

    async function connectToMongoose() {
      mongoose = await getMongooseConnection();

      logger.log({
        level: 'info',
        message: `Mongoose connection opened!`
      });
    }

    async function connectToRabbit() {
      rabbitServer = await getRabbitmqConnection();

      if (!ENABLED_SERVICES.CONSUMER) return;

      const consumersFolder = path.resolve(__dirname, 'consumers');
      await rabbitServer.consumersDirectory(consumersFolder);
      logger.log({ level: 'info', message: 'Consumer started' });
    }

    function connectToMemcached() {
      cacheServer = setMemcachedConnection();
      cacheServer.connect();
      logger.log({ level: 'info', message: 'Memcached started!' });
    }

    async function startServer() {
      await webServer.listen(SERVER.PORT);

      logger.log({
        level: 'info',
        message: `Server is running at: ${SERVER.PORT}`
      });

      logger.log({
        level: 'info',
        message: `Base URL: http://127.0.0.1:${SERVER.PORT}${SERVER.BASE_URI}`
      });
    }

    async function startAgendaDashboard() {
      await import('./agendash');
    }

    async function startWorker() {
      worker = workerManager();
      await worker.start();
      const workersFolder = path.resolve(__dirname, 'workers');
      await worker.tasksDirectory(workersFolder);
    }

    logger.log(
      { level: 'info', message: 'Dependency check started...' },
      'offline'
    );

    if (DB.ENABLED) promises.push(connectToSQL);
    if (MONGO.ENABLED) promises.push(connectToMongoose);
    if (RABBIT.ENABLED) promises.push(connectToRabbit);
    if (ENABLED_SERVICES.SERVER) promises.push(startServer);
    if (ENABLED_SERVICES.WORKER) promises.push(startWorker);
    if (ENABLED_SERVICES.DASHBOARD) promises.push(startAgendaDashboard);
    if (MEMCACHED.ENABLED) connectToMemcached();

    await splitPromises(promises, 2);

    setTimeout(() => {
      logger.log(
        { level: 'info', message: 'Check completed, all services are online' },
        'offline'
      );
    }, 500);

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

        if (mongoose) {
          await mongoose.disconnect();

          logger.log(
            {
              level: 'info',
              message: 'Mongoose connection closed'
            },
            'offline'
          );
        }

        if (cacheServer) {
          cacheServer.disconnect();
          logger.log({
            level: 'info',
            message: 'Memcached connection closed'
          });
        }

        process.exit(0);
      } catch (error) {
        logger.log(error);
        process.exit(1);
      }
    }

    process.on('SIGINT', gracefulShutdown);
    process.on('SIGTERM', gracefulShutdown);
  } catch (error) {
    logger.log(error);
    throw error;
  }
}
