import { InputAndOutputLogRepository } from '@/infra/db/mongodb/input-and-output-log/input-and-output-log-repository';
import { LOGGER } from '@/util';

export const createAmqpLog = async (payload: object): Promise<void> => {
  if (!LOGGER.DATABASE.ENABLED) return;
  await new InputAndOutputLogRepository().create({
    type: 'AMQP',
    ...payload,
  });
};
