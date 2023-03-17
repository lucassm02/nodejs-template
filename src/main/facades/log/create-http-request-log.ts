import { InputAndOutputLogRepository } from '@/infra/db/mongodb/input-and-output-log/input-and-output-log-repository';
import { getAPMTransactionIds, logger, LOGGER } from '@/util';

type Params = { url: string; request: object; response: object };

export const createHttpRequestLog = async (params: Params): Promise<void> => {
  try {
    if (!LOGGER.DB.ENABLED) return;

    const ids = getAPMTransactionIds();

    const inputAndOutputLogRepository = new InputAndOutputLogRepository();
    await inputAndOutputLogRepository.create({
      type: 'HTTP',
      traceId: ids?.traceId,
      transactionId: ids?.transactionId,
      ...params,
    });
  } catch (error) {
    logger.log(error, 'offline');
  }
};
