import { sqlConnection } from '@/infra/db/mssql/util';
import { WorkerManager } from '@/infra/worker';
import { logger, MONGO } from '@/util';
import mongoose from 'mongoose';
import path from 'path';

const manager = WorkerManager.getInstance();

(async () => {
  try {
    const mongoPromise = mongoose
      .set('strictQuery', false)
      .connect(MONGO.URL(), {
        dbName: MONGO.NAME,
        authSource: MONGO.AUTH_SOURCE,
        authMechanism: 'SCRAM-SHA-1',
      });

    const sqlPromise = sqlConnection.raw('SELECT 1');

    await Promise.all([mongoPromise, sqlPromise]);

    const workersFolder = path.resolve(__dirname, 'workers');

    manager.tasksDirectory(workersFolder);
  } catch (error) {
    logger.log(error);
  }
})();
