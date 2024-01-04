import { ExampleRepository } from '@/infra/db/mssql/example-database';
import { migrate } from '@/test/migrations/example-db';
import { seedExampleDatabase } from '@/test/seed/example-db-seed';

type SutTypes = {
  sut: ExampleRepository;
};

const makeSut = (): SutTypes => {
  const sut = new ExampleRepository();
  return {
    sut
  };
};

describe('Example DB', () => {
  beforeAll(async () => {
    await migrate.up.ExampleDbUnitTest();
    await seedExampleDatabase();
  });
  afterAll(async () => {
    await migrate.down();
  });
  it('should not throws if update works correctly', async () => {
    const { sut } = makeSut();

    const result = await sut.update({
      exampleId: 1,
      value: 100,
      description: 'foo'
    });

    expect(result).toBeUndefined();
  });
  it('should return all the example not deleted by the fooId', async () => {
    const { sut } = makeSut();

    const result = await sut.getFooWithExample({
      fooId: 1
    });

    expect(result).toEqual([
      {
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        deletedAt: null,
        description: null,
        exampleId: 1,
        fooId: 1,
        value: 100
      }
    ]);
  });
});
