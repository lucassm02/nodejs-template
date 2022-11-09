import { InputAndOutputLogRepository } from '@/infra/db/mongodb/input-and-output-log/input-and-output-log-repository';
import { elasticAPM, LOGGER } from '@/util';

export const createAmqpLog = async (payload: object): Promise<void> => {
  if (!LOGGER.DB.ENABLED) return;
  const { traceId, transactionId } = (() => {
    const apm = elasticAPM().getAPM();

    if (apm) {
      const transactionId = apm.currentTransaction?.ids['transaction.id'];
      const traceId = apm.currentTransaction?.ids['trace.id'];
      return { transactionId, traceId };
    }

    return { transactionId: undefined, traceId: undefined };
  })();

  await new InputAndOutputLogRepository().create({
    type: 'AMQP',
    traceId,
    transactionId,
    ...payload,
  });
};
