import { PublishDataToReprocessing } from '@/domain/usecases';

export class PublishDataToReprocessingStub
  implements PublishDataToReprocessing
{
  async publish(): PublishDataToReprocessing.Result {}
}
