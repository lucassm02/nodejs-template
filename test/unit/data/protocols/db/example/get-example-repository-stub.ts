import { GetExampleRepository } from '@/data/protocols/db';
import { exampleModelMock } from '@/test/unit/domain/models';

export class GetExampleRepositoryStub implements GetExampleRepository {
  get(): GetExampleRepository.Result {
    return Promise.resolve([exampleModelMock]);
  }
}
