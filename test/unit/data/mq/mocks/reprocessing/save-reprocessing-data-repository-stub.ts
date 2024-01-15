import { SaveReprocessingDataRepository } from '@/data/protocols/db';

export class SaveReprocessingDataRepositoryStub
  implements SaveReprocessingDataRepository
{
  async save(): SaveReprocessingDataRepository.Result {}
}
