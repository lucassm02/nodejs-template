import { DeleteReprocessingByIdentifierRepository } from '@/data/protocols/db';
import { DeleteReprocessingByIdentifier } from '@/domain/usecases';

export class DbDeleteReprocessingByIdentifier
  implements DeleteReprocessingByIdentifier
{
  constructor(
    private readonly deleteReprocessingByIdentifierRepository: DeleteReprocessingByIdentifierRepository
  ) {}
  async delete(
    params: DeleteReprocessingByIdentifier.Params
  ): DeleteReprocessingByIdentifier.Result {
    const reprocessingIds = params.map(({ reprocessingId }) => reprocessingId);
    await this.deleteReprocessingByIdentifierRepository.delete({
      reprocessingIds
    });
  }
}
