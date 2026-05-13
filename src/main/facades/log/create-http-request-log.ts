import { InputAndOutputLogRepository } from '@/infra/db/mongodb/input-and-output-log/input-and-output-log-repository';
import { getAPMTransactionIds, logger, LOGGER } from '@/util';
import { sanitizeObject } from '@/util/security/sanitize-object';

type Params = {
  url: string;
  request: Record<string, unknown>;
  response: Record<string, unknown>;
};

export const createHttpRequestLog = async (params: Params): Promise<void> => {
  try {
    if (!LOGGER.DB.ENABLED) return;

    const ids = getAPMTransactionIds();

    await new InputAndOutputLogRepository().create({
      type: 'HTTP',
      traceId: ids?.traceId,
      transactionId: ids?.transactionId,
      ...sanitizeObject(params),
    });
  } catch (error) {
    logger.log(error, 'offline');
  }
};
