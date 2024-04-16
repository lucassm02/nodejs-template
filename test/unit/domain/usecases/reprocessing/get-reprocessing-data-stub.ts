import { GetReprocessingData } from '@/domain/usecases';
import { mockReprocessingModel } from '@/test/unit/domain/models';

export class GetReprocessingDataStub implements GetReprocessingData {
  async get(): GetReprocessingData.Result {
    return [mockReprocessingModel];
  }
}
