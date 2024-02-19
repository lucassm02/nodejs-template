import { DeleteReprocessingByIdentifier } from '@/domain/usecases';

export class DeleteReprocessingByIdentifierStub
  implements DeleteReprocessingByIdentifier
{
  async delete(): DeleteReprocessingByIdentifier.Result {}
}
