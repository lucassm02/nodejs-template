import { InputAndOutputLogRepository } from '@/infra/db/mongodb/input-and-output-log/input-and-output-log-repository';
import { getAPMTransactionIds, LOGGER } from '@/util';

export const createAmqpLog = async (payload: object): Promise<void> => {
  if (!LOGGER.DB.ENABLED) return;

  const ids = getAPMTransactionIds();

  await new InputAndOutputLogRepository().create({
    type: 'AMQP',
    traceId: ids?.traceId,
    transactionId: ids?.transactionId,
    ...payload,
  });
};
