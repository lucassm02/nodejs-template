import { GetReprocessingDataRepository } from '@/data/protocols/db';
import { mockReprocessingModel } from '@/test/unit/domain/models';

export class GetReprocessingDataRepositoryStub
  implements GetReprocessingDataRepository
{
  async get(): GetReprocessingDataRepository.Result {
    return [mockReprocessingModel];
  }
}
