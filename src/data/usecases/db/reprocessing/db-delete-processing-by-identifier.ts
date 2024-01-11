import { DeleteProcessingByIdentifierRepository } from '@/data/protocols/db';
import { DeleteProcessingByIdentifier } from '@/domain/usecases';

export class DbDeleteProcessingByIdentifier
  implements DeleteProcessingByIdentifier
{
  constructor(
    private readonly deleteProcessingByIdentifierRepository: DeleteProcessingByIdentifierRepository
  ) {}
  async delete(
    params: DeleteProcessingByIdentifier.Params
  ): DeleteProcessingByIdentifier.Result {
    const reprocessingIds = params.map(({ reprocessingId }) => reprocessingId);
    await this.deleteProcessingByIdentifierRepository.delete({
      reprocessingIds
    });
  }
}
