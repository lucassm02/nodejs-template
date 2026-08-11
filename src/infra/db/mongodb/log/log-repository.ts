import { CreateLogRepository } from '@/data/protocols/db';
import { LOGGER, convertCamelCaseKeysToSnakeCase, logger } from '@/util';

import { LogModel } from './log-model';
import { BulkInsertBuffer } from '../util/bulk-insert-buffer';

// A log write failure must not go back through the database transport, or the
// error feeds the very buffer that produced it.
const logBufferError = (error: unknown) => {
  logger.log(error instanceof Error ? error : new Error(String(error)), 'offline');
};

export class LogRepository implements CreateLogRepository {
  private static buffer = new BulkInsertBuffer<Record<string, unknown>>(
    LogModel,
    {
      maxSize: LOGGER.DB.BULK_SIZE,
      flushIntervalMs: LOGGER.DB.FLUSH_INTERVAL_MS,
      maxQueueSize: LOGGER.DB.MAX_QUEUE_SIZE,
      onError: logBufferError
    }
  );

  public async create(
    params: CreateLogRepository.Params
  ): CreateLogRepository.Result {
    try {
      const formattedParams = convertCamelCaseKeysToSnakeCase(params);
      LogRepository.buffer.enqueue(formattedParams);
    } catch (error) {
      logger.log(<Error>error, 'offline');
    }
  }

  public static async flush(): Promise<void> {
    await LogRepository.buffer.flush();
  }
}
