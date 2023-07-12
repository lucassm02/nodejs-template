import { InputAndOutputLogRepository } from '@/infra/db/mongodb/input-and-output-log/input-and-output-log-repository';
import { getAPMTransactionIds, logger, LOGGER } from '@/util';

export const createDefaultLog = async (
  payload: Record<string, unknown>,
  type: string
): Promise<void> => {
  try {
    if (!LOGGER.DB.ENABLED) return;

    const ids = getAPMTransactionIds();

    console.log(type);

    await new InputAndOutputLogRepository().create({
      traceId: ids?.traceId,
      transactionId: ids?.transactionId,
      ...payload,
      type: type,
    });
  } catch (error) {
    logger.log(error, 'offline');
  }
};
