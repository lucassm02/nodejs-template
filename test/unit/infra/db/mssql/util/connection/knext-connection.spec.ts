import { getConfig } from '@/infra/db/mssql/util';
import { DB } from '@/util';

describe('KNEX connection config', () => {
  it('returns default config when DB CONFIG is not test', () => {
    DB.CONFIG = 'production';

    const config = getConfig();

    const values = Object.keys(config.connection);
    const expectedValues = [
      'host',
      'port',
      'user',
      'password',
      'requestTimeout',
      'options'
    ];

    expect(values).toEqual(expectedValues);
    expect(config.client).toBeTruthy();
  });

  it('returns test config when DB CONFIG is test', () => {
    DB.CONFIG = 'test';
    const config = getConfig();

    const expected = ':memory:';
    expect(config.connection).toEqual(expected);
    expect(config.client).toBeTruthy();
  });
});
