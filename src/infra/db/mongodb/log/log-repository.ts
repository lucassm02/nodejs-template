import { CreateLogRepository } from '@/data/protocols/db';
import { LOGGER, convertCamelCaseKeysToSnakeCase, logger } from '@/util';

import { LogModel } from './log-model';
import { BulkInsertBuffer } from '../util/bulk-insert-buffer';

const logBufferError = (error: unknown) => {
  logger.log(error instanceof Error ? error : new Error(String(error)));
};

export class LogRepository implements CreateLogRepository {
  private static buffer = new BulkInsertBuffer<Record<string, unknown>>(
    LogModel,
    {
      maxSize: LOGGER.DB.BULK_SIZE,
      flushIntervalMs: LOGGER.DB.FLUSH_INTERVAL_MS,
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
      logger.log(error);
    }
  }

  public static async flush(): Promise<void> {
    await LogRepository.buffer.flush();
  }
}
