import k from 'knex';

import { dateConverterToSqliteDriver } from './date-converter-to-sqlite';
import { syntaxInTestEnvironmentInterceptor } from './syntax-in-test-environment-interceptor';
import { dateConverterToDefaultDate } from './date-converter-to-default-date';

const SQLITE_PLUS = 'sqlite3+';
const SQLITE = 'sqlite3';

export function sqLitePlus(knex: typeof k) {
  const proxy = new Proxy(knex, {
    apply(
      targetWithoutModifications,
      _,
      [{ client, ...otherArg }]: [k.Knex.Config]
    ) {
      let target = targetWithoutModifications;

      const isSqlitePlus = client?.toString().toLowerCase() === SQLITE_PLUS;
      const oficialClient = client === SQLITE_PLUS ? SQLITE : client;

      if (isSqlitePlus) {
        target = dateConverterToDefaultDate(target);
      }

      let instance = target({ ...otherArg, client: oficialClient });

      if (!isSqlitePlus) return instance;

      instance = dateConverterToSqliteDriver(instance);
      instance = syntaxInTestEnvironmentInterceptor(instance);

      return instance;
    }
  });

  return proxy;
}
