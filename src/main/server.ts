import { sqlConnection } from '@/infra/db/mssql/util/connection';
import { logger } from '@/util';
import { MONGO, SERVER } from '@/util/constants';
import mongoose from 'mongoose';

import { application } from './application';

application.onStart(async () => {
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

application.listenAsync(SERVER.PORT, () => {
  logger.log({
    level: 'info',
    message: `Server is running on port: ${SERVER.PORT}`,
  });
});
