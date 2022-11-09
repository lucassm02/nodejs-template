import { InputAndOutputLogRepository } from '@/infra/db/mongodb/input-and-output-log/input-and-output-log-repository';
import { elasticAPM, LOGGER } from '@/util';

type Params = { url: string; request: object; response: object };

export const createHttpRequestLog = async (params: Params): Promise<void> => {
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

  const inputAndOutputLogRepository = new InputAndOutputLogRepository();
  await inputAndOutputLogRepository.create({
    type: 'HTTP',
    traceId,
    transactionId,
    ...params,
  });
};
