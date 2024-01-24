import { DeleteReprocessingByIdentifierRepository } from '@/data/protocols/db';

export class DeleteReprocessingByIdentifierRepositoryStub
  implements DeleteReprocessingByIdentifierRepository
{
  async delete(): DeleteReprocessingByIdentifierRepository.Result {}
}
