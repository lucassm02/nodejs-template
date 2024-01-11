import {
  DeleteProcessingByIdentifierRepository,
  GetReprocessingDataByIdentifierRepository,
  SaveReprocessingDataRepository
} from '@/data/protocols/db/reprocessing';
import {
  convertCamelCaseKeysToSnakeCase,
  convertSnakeCaseKeysToCamelCase
} from '@/util';

import { ReprocessingModel } from './reprocessing-model';

export class ReprocessingRepository
  implements
    SaveReprocessingDataRepository,
    GetReprocessingDataByIdentifierRepository,
    DeleteProcessingByIdentifierRepository
{
  async save({
    queue,
    message,
    exchange,
    routingKey
  }: SaveReprocessingDataRepository.Params): SaveReprocessingDataRepository.Result {
    const formattedParams = convertCamelCaseKeysToSnakeCase({
      queue,
      message,
      exchange,
      routingKey
    });

    await ReprocessingModel.create(formattedParams);
  }

  async getByIdentifier({
    reprocessingIds
  }: GetReprocessingDataByIdentifierRepository.Params): GetReprocessingDataByIdentifierRepository.Result {
    const records = await ReprocessingModel.find({
      reprocessing_id: { $in: reprocessingIds }
    }).exec();

    const results = records.map((record) => ({
      reprocessingId: record.reprocessing_id,
      reprocessing: record.message.reprocessing,
      queue: record.queue
    }));

    return convertSnakeCaseKeysToCamelCase(results);
  }

  async delete({
    reprocessingIds
  }: DeleteProcessingByIdentifierRepository.Params): DeleteProcessingByIdentifierRepository.Result {
    await ReprocessingModel.updateMany(
      {
        reprocessing_id: { $in: reprocessingIds }
      },
      { deleted_at: new Date() }
    ).exec();
  }
}
