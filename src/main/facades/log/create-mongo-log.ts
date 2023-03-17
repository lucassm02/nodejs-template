import { CreateLogRepository } from '@/data/protocols/db';
import { LogRepository } from '@/infra/db/mongodb/log/log-repository';
import { logger } from '@/util';

export const createMongoLog = async (
  params: CreateLogRepository.Params
): CreateLogRepository.Result => {
  const logRepository = new LogRepository();
  try {
    await logRepository.create(params);
  } catch (error) {
    logger.log(error, 'offline');
  }
};
