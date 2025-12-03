import { CreateInputAndOutputLogRepositoryRepository } from '@/data/protocols/db';
import { convertCamelCaseKeysToSnakeCase } from '@/util/object';
import { logger } from '@/util';

import { InputAndOutputLogModel } from './input-and-output-log-model';

export class InputAndOutputLogRepository
  implements CreateInputAndOutputLogRepositoryRepository
{
  public async create(
    params: CreateInputAndOutputLogRepositoryRepository.Params
  ): CreateInputAndOutputLogRepositoryRepository.Result {
    try {
      const formattedParams = convertCamelCaseKeysToSnakeCase(params);

      await InputAndOutputLogModel.create(formattedParams, {
        writeConcern: { w: 0 }
      });
    } catch (error) {
      logger.log(error);
    }
  }
}
