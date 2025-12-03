import { CreateLogRepository } from '@/data/protocols/db';
import { convertCamelCaseKeysToSnakeCase, logger } from '@/util';

import { LogModel } from './log-model';

export class LogRepository implements CreateLogRepository {
  public async create(
    params: CreateLogRepository.Params
  ): CreateLogRepository.Result {
    try {
      const formattedParams = convertCamelCaseKeysToSnakeCase(params);
      await LogModel.create(formattedParams, { writeConcern: { w: 0 } });
    } catch (error) {
      logger.log(error);
    }
  }
}
