import { CreateLogRepository } from '@/data/protocols/db';
import { convertCamelCaseKeysToSnakeCase } from '@/util';

import { LogModel } from './log-model';

export class LogRepository implements CreateLogRepository {
  public async create(
    params: CreateLogRepository.Params
  ): CreateLogRepository.Result {
    const formattedParams = convertCamelCaseKeysToSnakeCase(params);
    await LogModel.create(formattedParams);
  }
}
