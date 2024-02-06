import { UpdateDocumentService } from '@/data/protocols/elasticsearch';

export class UpdateDocumentServiceStub implements UpdateDocumentService {
  async update(): UpdateDocumentService.Result {
    return { id: 'any_id' };
  }
}
