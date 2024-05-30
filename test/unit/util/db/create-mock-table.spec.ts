import { EXAMPLE_DB, sqlConnection } from '@/infra/db/mssql/util';
import { createMockTable } from '@/util/db';
import { boolean, date, number, string } from '@/util/db/types';

const {
  EXAMPLE: { EXAMPLE }
} = EXAMPLE_DB;

describe('Create Mock Table', () => {
  afterEach(async () => {
    process.env.NODE_ENV = 'test';
  });

  afterAll(() => {
    process.env.NODE_ENV = 'test';
  });

  it('should throw error when NODE_ENV is diff of test', async () => {
    process.env.NODE_ENV = 'environment';

    try {
      await createMockTable(EXAMPLE, {
        created_at: date().default(() => new Date()),
        updated_at: date().default(() => new Date()),
        deleted_at: date().default(() => new Date()),
        description: string(),
        external_id: string(),
        example_id: number(),
        value: number()
      });
    } catch (error) {
      expect(error.message).toBe(
        'Need to be in a test environment to use this function'
      );
    }
  });

  it('should create table without default values', async () => {
    try {
      await createMockTable(EXAMPLE, {
        created_at: date(),
        updated_at: date(),
        deleted_at: date(),
        description: string(),
        external_id: string(),
        example_id: number(),
        value: boolean()
      });
    } catch (error) {
      expect(error).toBeNull();
    }

    await sqlConnection.schema.dropTable(EXAMPLE.TABLE);
  });

  it('should create table with default values', async () => {
    try {
      await createMockTable(EXAMPLE, {
        created_at: date().default(() => new Date()),
        updated_at: date().default(() => new Date()),
        deleted_at: date().default(() => new Date()),
        description: string().default(() => 'description'),
        external_id: string().default(() => 'external_id'),
        example_id: number().default(() => 1),
        value: boolean().default(() => true)
      });
    } catch (error) {
      expect(error).toBeNull();
    }

    await sqlConnection.schema.dropTable(EXAMPLE.TABLE);
  });
});
