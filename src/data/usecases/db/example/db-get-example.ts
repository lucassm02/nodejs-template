import { GetExampleRepository } from '@/data/protocols/db/example';
import { GetExample } from '@/domain/usecases/example';

export class DbGetExample implements GetExample {
  constructor(private readonly getExampleRepository: GetExampleRepository) {}

  async get(): GetExample.Result {
    return this.getExampleRepository.get();
  }
}
