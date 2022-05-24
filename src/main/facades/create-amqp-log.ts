import { InputAndOutputLogRepository } from '@/infra/db/mongodb/input-and-output-log/input-and-output-log-repository';

export const createAmqpLog = async (payload: object): Promise<void> => {
  await new InputAndOutputLogRepository().create({
    type: 'AMQP',
    ...payload,
  });
};
