import { getTableName } from '@/infra/db/mssql/util/schema/get-table-name';

describe('GetTableName Function', () => {
  afterEach(async () => {
    process.env.NODE_ENV = 'test';
  });

  afterAll(() => {
    process.env.NODE_ENV = 'test';
  });

  it('should return a table name with "database.table" when NODE_ENV is diff of "test"', () => {
    process.env.NODE_ENV = 'environment';

    const result = getTableName('Database', {
      table: 'table',
      columns: ['columns']
    });

    const expected = '[Database].table';
    expect(result).toStrictEqual(expected);
  });

  it('should throw error when table not match regex', () => {
    try {
      getTableName('Database', {
        table: 'invalid_table',
        columns: ['columns']
      });
    } catch (error) {
      const expected =
        'Match value for table invalid_table does not match with default pattern';
      expect(error.message).toStrictEqual(expected);
    }
  });

  it('should formatted table name', () => {
    const result = getTableName('Database', {
      table: '[Database].[tb_table]',
      columns: ['columns']
    });

    const expected = 'tb_table';
    expect(result).toStrictEqual(expected);
  });
});
