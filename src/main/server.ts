import { sqlConnection } from '@/infra/db/mssql/utils/connection';
import { logger } from '@/util';
import { MONGO, SERVER } from '@/util/constants';
import mongoose from 'mongoose';

import { server } from './application';

server.onStart(async () => {
  try {
    await mongoose.connect(MONGO.URL(), {
      dbName: MONGO.NAME,
      authSource: MONGO.AUTH_SOURCE,
      authMechanism: 'SCRAM-SHA-1',
    });

    await sqlConnection.raw('SELECT 1');
  } catch (error) {
    logger.log(error);
    throw error;
  }
});

server.listenAsync(SERVER.PORT, () => {
  logger.log({
    level: 'info',
    message: `Server is running on port: ${SERVER.PORT}`,
  });
});
