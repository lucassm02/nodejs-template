import { CreateExampleRepository } from '@/data/protocols/db';

export class CreateExampleRepositoryStub implements CreateExampleRepository {
  create(): CreateExampleRepository.Result {
    return Promise.resolve({
      record: {
        exampleId: 1,
        externalId: 'external_id',
        value: 'value',
        description: 'description',
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-01'),
        deletedAt: new Date('2023-01-01')
      },
      transaction: { commit: async () => {}, rollback: async () => {} }
    });
  }
}
