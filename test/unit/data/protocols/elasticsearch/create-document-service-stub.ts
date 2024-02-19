import { CreateDocumentService } from '@/data/protocols/elasticsearch';

export class CreateDocumentServiceStub implements CreateDocumentService {
  async create(): CreateDocumentService.Result {
    return { id: 'any_id' };
  }
}
