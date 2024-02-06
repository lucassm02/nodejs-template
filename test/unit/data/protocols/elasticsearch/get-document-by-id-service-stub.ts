import { GetDocumentByIdService } from '@/data/protocols/elasticsearch';

export class GetDocumentByIdServiceStub implements GetDocumentByIdService {
  async getById(): GetDocumentByIdService.Result {
    return { id: 'any_id' };
  }
}
