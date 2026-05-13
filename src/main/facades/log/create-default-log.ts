import { InputAndOutputLogRepository } from '@/infra/db/mongodb/input-and-output-log/input-and-output-log-repository';
import { getAPMTransactionIds, logger, LOGGER } from '@/util';
import { sanitizeObject } from '@/util/security/sanitize-object';

export const createDefaultLog = async (
  payload: Record<string, unknown>,
  type: string
): Promise<void> => {
  try {
    if (!LOGGER.DB.ENABLED) return;

    const ids = getAPMTransactionIds();

    await new InputAndOutputLogRepository().create({
      traceId: ids?.traceId,
      transactionId: ids?.transactionId,
      ...sanitizeObject(payload),
      type: type,
    });
  } catch (error) {
    logger.log(error, 'offline');
  }
};
