import { GetReprocessingDataRepository } from '@/data/protocols/db';
import { GetReprocessingData } from '@/domain/usecases';

export class DbGetReprocessingData implements GetReprocessingData {
  constructor(
    private readonly getReprocessingDataRepository: GetReprocessingDataRepository
  ) {}
  async get({
    queue,
    exchange,
    routingKey
  }: GetReprocessingData.Params): GetReprocessingData.Result {
    const reprocessing = await this.getReprocessingDataRepository.get({
      queue,
      exchange,
      routingKey
    });

    if (!reprocessing.length)
      throw new Error(
        GetReprocessingData.Exceptions.REPROCESSING_DATA_NOT_FOUND
      );

    return reprocessing;
  }
}
