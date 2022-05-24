import { CreateLogRepository } from '@/data/protocols/db';
import { LogRepository } from '@/infra/db/mongodb/log/log-repository';

export const createMongoLog = async (
  params: CreateLogRepository.Params
): CreateLogRepository.Result => {
  const logRepository = new LogRepository();
  await logRepository.create(params);
};
