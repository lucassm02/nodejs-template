import { CreateInputAndOutputLogRepositoryRepository } from '@/data/protocols/db';
import { convertCamelCaseKeysToSnakeCase } from '@/util/object';

import { InputAndOutputLogModel } from './input-and-output-log-model';

export class InputAndOutputLogRepository
  implements CreateInputAndOutputLogRepositoryRepository
{
  public async create(
    params: CreateInputAndOutputLogRepositoryRepository.Params
  ): CreateInputAndOutputLogRepositoryRepository.Result {
    const formattedParams = convertCamelCaseKeysToSnakeCase(params);

    await InputAndOutputLogModel.create(formattedParams);
  }
}
