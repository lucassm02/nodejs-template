import mongoose from 'mongoose';

import { CreateLogRepository } from '@/data/protocols/db';
import { LogRepository } from '@/infra/db/mongodb/log/log-repository';
import { logger } from '@/util';

const MONGOOSE_CONNECTED_STATE = 1;

export const createMongoLog = async (
  params: CreateLogRepository.Params
): CreateLogRepository.Result => {
  // With no connection (e.g. during/after shutdown) the log goes only to the
  // offline transports, avoiding cascading errors from the Mongo driver.
  if (mongoose.connection.readyState !== MONGOOSE_CONNECTED_STATE) return;

  const logRepository = new LogRepository();
  try {
    await logRepository.create(params);
  } catch (error) {
    logger.log(error, 'offline');
  }
};
