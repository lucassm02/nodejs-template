import { GetReprocessingDataRepository } from '@/data/protocols/db';
import { GetReprocessingData } from '@/domain/usecases';

export class DbGetReprocessingData implements GetReprocessingData {
  constructor(
    private readonly getReprocessingDataRepository: GetReprocessingDataRepository
  ) {}
  async get({
    queue,
    exchange,
    finalDate,
    routingKey,
    initialDate
  }: GetReprocessingData.Params): GetReprocessingData.Result {
    const initialDateTime = initialDate ? `${initialDate} 00:00:00` : undefined;
    const finalDateTime = finalDate ? `${finalDate} 23:59:59` : undefined;

    const reprocessing = await this.getReprocessingDataRepository.get({
      queue,
      exchange,
      routingKey,
      finalDateTime,
      initialDateTime
    });

    if (!reprocessing.length)
      throw new Error(
        GetReprocessingData.Exceptions.REPROCESSING_DATA_NOT_FOUND
      );

    return reprocessing;
  }
}
