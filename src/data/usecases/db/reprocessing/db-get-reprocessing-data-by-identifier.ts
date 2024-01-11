import { GetReprocessingDataByIdentifierRepository } from '@/data/protocols/db';
import { GetReprocessingDataByIdentifier } from '@/domain/usecases';

export class DbGetReprocessingDataByIdentifier
  implements GetReprocessingDataByIdentifier
{
  constructor(
    private readonly getReprocessingDataByIdentifierRepository: GetReprocessingDataByIdentifierRepository
  ) {}
  async get({
    reprocessingIds
  }: GetReprocessingDataByIdentifier.Params): GetReprocessingDataByIdentifier.Result {
    const dataToReprocessing =
      await this.getReprocessingDataByIdentifierRepository.getByIdentifier({
        reprocessingIds
      });

    if (!dataToReprocessing.length)
      throw new Error(
        GetReprocessingDataByIdentifier.Exceptions.REPROCESSING_DATA_NOT_FOUND
      );

    return dataToReprocessing;
  }
}
