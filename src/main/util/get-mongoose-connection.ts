import mongoose from 'mongoose';

import { MONGO } from '@/util';

export function getMongooseConnection() {
  return mongoose.set('strictQuery', false).connect(MONGO.URL(), {
    dbName: MONGO.NAME,
    authSource: MONGO.AUTH_SOURCE,
    authMechanism: 'SCRAM-SHA-1'
  });
}
