import { GetReprocessingDataByIdentifier } from '@/domain/usecases';
import { mockReprocessingModel } from '@/test/unit/domain/models';

export class GetReprocessingDataByIdentifierStub
  implements GetReprocessingDataByIdentifier
{
  async get(): GetReprocessingDataByIdentifier.Result {
    return [mockReprocessingModel];
  }
}
