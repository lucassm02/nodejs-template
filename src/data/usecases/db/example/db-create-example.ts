import { CreateExampleRepository } from '@/data/protocols/db/example';
import { CreateExample } from '@/domain/usecases/example';

export class DbCreateExample implements CreateExample {
  constructor(
    private readonly createExampleRepository: CreateExampleRepository
  ) {}

  async create(params: CreateExample.Params): CreateExample.Result {
    return this.createExampleRepository.create(params);
  }
}
