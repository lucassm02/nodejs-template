import mongoose from 'mongoose';

import { MONGO } from '@/util';

export function getMongooseConnection() {
  return mongoose
    .set('strictQuery', false)
    .set('bufferTimeoutMS', MONGO.CONNECTION_TIMEOUT_MS)
    .connect(MONGO.URL(), {
      dbName: MONGO.NAME,
      authSource: MONGO.AUTH_SOURCE,
      authMechanism: 'SCRAM-SHA-1',
      serverSelectionTimeoutMS: MONGO.CONNECTION_TIMEOUT_MS,
      socketTimeoutMS: MONGO.CONNECTION_TIMEOUT_MS,
      connectTimeoutMS: MONGO.CONNECTION_TIMEOUT_MS,
      maxPoolSize: MONGO.MAX_POOL_SIZE,
      minPoolSize: MONGO.MIN_POOL_SIZE
    });
}
