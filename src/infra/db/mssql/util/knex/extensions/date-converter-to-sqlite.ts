import k, { ContextType, Statement } from 'knex';

import { convertDateToUnix, isDateValid } from '@/util';

function parseValueToUnixTimestamp(statement: Statement): Statement {
  if (
    !(statement.value instanceof Date) &&
    typeof statement.value !== 'string' &&
    typeof statement.value !== 'number'
  ) {
    return statement;
  }

  const date = new Date(statement.value);

  if (!isDateValid(date)) return statement;

  statement.value = String(convertDateToUnix(date));

  return statement;
}

export function dateConverterToSqliteDriver(knex: typeof k) {
  if (String(process.env.NODE_ENV).toLowerCase() !== 'test') return knex;

  const knexProxy = new Proxy(knex, {
    apply(target, _, [arg]) {
      const instance = target(arg);

      if (String(instance.client.config.client).toLowerCase() !== 'sqlite3')
        return instance;

      instance.on('start', (builder: ContextType) => {
        const convertedStatements = builder._statements?.map(
          parseValueToUnixTimestamp
        );

        builder._statements = convertedStatements;
      });

      return instance;
    }
  });

  return knexProxy;
}
