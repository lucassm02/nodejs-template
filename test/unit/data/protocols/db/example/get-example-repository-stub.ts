import { GetExampleRepository } from '@/data/protocols/db';

export class GetExampleRepositoryStub implements GetExampleRepository {
  get(): GetExampleRepository.Result {
    return Promise.resolve([
      {
        exampleId: 1,
        externalId: 'external_id',
        value: 'value',
        description: 'description',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: new Date()
      }
    ]);
  }
}
