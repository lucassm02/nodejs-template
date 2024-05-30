import { CreateExampleRepository } from '@/data/protocols/db';
import { exampleModelMock } from '@/test/unit/domain/models';

export class CreateExampleRepositoryStub implements CreateExampleRepository {
  create(): CreateExampleRepository.Result {
    return Promise.resolve({
      record: exampleModelMock,
      transaction: { commit: async () => {}, rollback: async () => {} }
    });
  }
}
