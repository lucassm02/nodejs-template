import { makeTableBuilder } from '@/infra/db/mssql/util';

describe('MakeTableBuilder Function', () => {
  it('should return table options without prefix', () => {
    const builder = makeTableBuilder({
      database: 'Database'
    });

    const result = builder({
      table: '[Database].[table]',
      columns: ['column']
    });

    const expected = {
      ALIAS: 'table as [[DATABASE].[TABLE]]',
      COLUMNS: {
        COLUMN: 'table.column'
      },
      RAW_COLUMNS: ['column'],
      TABLE: 'table',
      getColumnsObject: expect.any(Function)
    };
    expect(result).toStrictEqual(expected);
  });

  it('should return table options without alias', () => {
    const builder = makeTableBuilder({
      database: 'Database',
      tablePrefix: 'prefix'
    });

    const result = builder({
      table: '[Database].[table]',
      columns: ['column']
    });

    const expected = {
      ALIAS: 'table as [[DATABASE].[TABLE]]',
      COLUMNS: {
        COLUMN: 'table.column'
      },
      RAW_COLUMNS: ['column'],
      TABLE: 'table',
      getColumnsObject: expect.any(Function)
    };
    expect(result).toStrictEqual(expected);
  });

  it('should return table options with alias', () => {
    const builder = makeTableBuilder({
      database: 'Database',
      tablePrefix: 'prefix'
    });

    const result = builder({
      table: '[Database].[table]',
      columns: ['column'],
      alias: 'alias'
    });

    const expected = {
      ALIAS: 'table as [alias]',
      COLUMNS: {
        COLUMN: 'table.column'
      },
      RAW_COLUMNS: ['column'],
      TABLE: 'table',
      getColumnsObject: expect.any(Function)
    };
    expect(result).toStrictEqual(expected);
  });

  it('should return columns with upper case', () => {
    const builder = makeTableBuilder({
      database: 'Database',
      tablePrefix: 'prefix'
    });

    const result = builder({
      table: '[Database].[table]',
      columns: ['column', 'column_2'],
      alias: 'alias'
    }).getColumnsObject('UPPER');

    const expected = {
      COLUMN: 'table.column',
      COLUMN_2: 'table.column_2'
    };
    expect(result).toStrictEqual(expected);
  });

  it('should return columns with lower case', () => {
    const builder = makeTableBuilder({
      database: 'Database',
      tablePrefix: 'prefix'
    });

    const result = builder({
      table: '[Database].[table]',
      columns: ['column', 'column_2'],
      alias: 'alias'
    }).getColumnsObject('LOWER');

    const expected = {
      column: 'table.column',
      column_2: 'table.column_2'
    };
    expect(result).toStrictEqual(expected);
  });

  it('should return columns with camel case', () => {
    const builder = makeTableBuilder({
      database: 'Database',
      tablePrefix: 'prefix'
    });

    const result = builder({
      table: '[Database].[table]',
      columns: ['column', 'column_2'],
      alias: 'alias'
    }).getColumnsObject('CAMEL');

    const expected = {
      column: 'table.column',
      column2: 'table.column_2'
    };
    expect(result).toStrictEqual(expected);
  });

  it('should return columns with lower case', () => {
    const builder = makeTableBuilder({
      database: 'Database',
      tablePrefix: 'prefix'
    });

    const result = builder({
      table: '[Database].[table]',
      columns: ['column', 'column_2'],
      alias: 'alias'
    }).getColumnsObject('LOWER');

    const expected = {
      column: 'table.column',
      column_2: 'table.column_2'
    };
    expect(result).toStrictEqual(expected);
  });

  it('should return columns with snake case', () => {
    const builder = makeTableBuilder({
      database: 'Database',
      tablePrefix: 'prefix'
    });

    const result = builder({
      table: '[Database].[table]',
      columns: ['column', 'column_2', 'columnNumber3'],
      alias: 'alias'
    }).getColumnsObject('SNAKE');

    const expected = {
      column: 'table.column',
      column_2: 'table.column_2',
      column_number3: 'table.columnNumber3'
    };
    expect(result).toStrictEqual(expected);
  });
});
