import { CreateInputAndOutputLogRepositoryRepository } from '@/data/protocols/db';
import { convertCamelCaseKeysToSnakeCase } from '@/util/object';
import { LOGGER, logger } from '@/util';

import { InputAndOutputLogModel } from './input-and-output-log-model';
import { BulkInsertBuffer } from '../util/bulk-insert-buffer';

const logBufferError = (error: unknown) => {
  logger.log(error instanceof Error ? error : new Error(String(error)));
};

export class InputAndOutputLogRepository
  implements CreateInputAndOutputLogRepositoryRepository
{
  private static buffer = new BulkInsertBuffer<Record<string, unknown>>(
    InputAndOutputLogModel,
    {
      maxSize: LOGGER.DB.BULK_SIZE,
      flushIntervalMs: LOGGER.DB.FLUSH_INTERVAL_MS,
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
      logger.log(error);
    }
  }

  public static async flush(): Promise<void> {
    await InputAndOutputLogRepository.buffer.flush();
  }
}
