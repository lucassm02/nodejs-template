import { getConfig } from '@/infra/db/mssql/util';

describe('KNEX connection config', () => {
  it('returns default config when NODE_ENV is not test', () => {
    process.env.NODE_ENV = 'production';

    const config = getConfig();

    const values = Object.keys(config.connection);
    const expectedValues = ['host', 'port', 'user', 'password', 'options'];
    expect(values).toEqual(expectedValues);
    expect(config.client).toBeTruthy();
  });

  it('returns test config when NODE_ENV is test', () => {
    process.env.NODE_ENV = 'test';
    const config = getConfig();

    const expected = ':memory:';
    expect(config.connection).toEqual(expected);
    expect(config.client).toBeTruthy();
  });
});
