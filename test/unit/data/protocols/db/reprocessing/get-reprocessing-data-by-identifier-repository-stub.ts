import { GetReprocessingDataByIdentifierRepository } from '@/data/protocols/db';
import { mockReprocessingModel } from '@/test/unit/domain';

export class GetReprocessingDataByIdentifierRepositoryStub
  implements GetReprocessingDataByIdentifierRepository
{
  async getByIdentifier(): GetReprocessingDataByIdentifierRepository.Result {
    return [mockReprocessingModel];
  }
}
