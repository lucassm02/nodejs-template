import {
  DeleteReprocessingByIdentifierRepository,
  GetReprocessingDataRepository,
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
    DeleteReprocessingByIdentifierRepository,
    GetReprocessingDataRepository
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
      queue: record.queue,
      createdAt: record.created_at
    }));

    return convertSnakeCaseKeysToCamelCase(results);
  }

  async delete({
    reprocessingIds
  }: DeleteReprocessingByIdentifierRepository.Params): DeleteReprocessingByIdentifierRepository.Result {
    await ReprocessingModel.updateMany(
      {
        reprocessing_id: { $in: reprocessingIds }
      },
      { deleted_at: new Date() }
    ).exec();
  }

  async get({
    queue,
    exchange,
    routingKey,
    finalDateTime,
    initialDateTime
  }: GetReprocessingDataRepository.Params): GetReprocessingDataRepository.Result {
    const query: Record<string, unknown> = {
      $or: [{ queue }, { exchange }, { routing_key: routingKey }, {}],
      deleted_at: null
    };

    if (initialDateTime && finalDateTime) {
      query.created_at = {
        $gte: initialDateTime,
        $lt: finalDateTime
      };
    }

    const records = await ReprocessingModel.find(query).exec();

    const results = records.map((record) => ({
      reprocessingId: record.reprocessing_id,
      reprocessing: record.message.reprocessing,
      queue: record.queue,
      createdAt: record.created_at
    }));

    return convertSnakeCaseKeysToCamelCase(results);
  }
}
