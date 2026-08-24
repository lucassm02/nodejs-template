import { CreateInputAndOutputLogRepositoryRepository } from '@/data/protocols/db';
import { convertCamelCaseKeysToSnakeCase } from '@/util/object';
import { LOGGER, logger } from '@/util';

import { InputAndOutputLogModel } from './input-and-output-log-model';
import { BulkInsertBuffer } from '../util/bulk-insert-buffer';

// A log write failure must not go back through the database transport, or the
// error feeds the very buffer that produced it.
const logBufferError = (error: unknown) => {
  logger.log(
    error instanceof Error ? error : new Error(String(error)),
    'offline'
  );
};

export class InputAndOutputLogRepository
  implements CreateInputAndOutputLogRepositoryRepository
{
  private static buffer = new BulkInsertBuffer<Record<string, unknown>>(
    InputAndOutputLogModel,
    {
      maxSize: LOGGER.DB.BULK_SIZE,
      flushIntervalMs: LOGGER.DB.FLUSH_INTERVAL_MS,
      maxQueueSize: LOGGER.DB.MAX_QUEUE_SIZE,
      onError: logBufferError
    }
  );

  public async create(
    params: CreateInputAndOutputLogRepositoryRepository.Params
  ): CreateInputAndOutputLogRepositoryRepository.Result {
    try {
      const formattedParams = convertCamelCaseKeysToSnakeCase(params);

      InputAndOutputLogRepository.buffer.enqueue(formattedParams);
    } catch (error) {
      logger.log(<Error>error, 'offline');
    }
  }

  public static async flush(): Promise<void> {
    await InputAndOutputLogRepository.buffer.flush();
  }
}
