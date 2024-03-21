import { EXAMPLE_DB, sqlConnection } from '@/infra/db/mssql/util';
import { downMockTable, createMockTable } from '@/util/db';
import { boolean, date, number, string } from '@/util/db/types';

const {
  EXAMPLE: { EXAMPLE }
} = EXAMPLE_DB;

describe('Down Mock Table', () => {
  afterEach(async () => {
    process.env.NODE_ENV = 'test';
  });

  afterAll(() => {
    process.env.NODE_ENV = 'test';
  });

  it('should throw error when NODE_ENV is diff of test', async () => {
    process.env.NODE_ENV = 'environment';

    try {
      await downMockTable(EXAMPLE);
    } catch (error) {
      expect(error.message).toBe(
        'Need to be in a test environment to use this function'
      );
    }
  });

  it('should down a table on success', async () => {
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

      await downMockTable(EXAMPLE);

      await sqlConnection.select(EXAMPLE.TABLE);
    } catch (error) {
      expect(error.message).toBe(
        'select `tb_example` - SQLITE_ERROR: no such column: tb_example'
      );
    }
  });
});
