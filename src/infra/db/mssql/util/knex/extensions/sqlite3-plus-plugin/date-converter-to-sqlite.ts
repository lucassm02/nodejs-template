import { ContextType, Knex, Statement } from 'knex';

import { convertDateToUnix, isDateValid } from '@/util';

function parseValueToUnixTimestamp(statement: Statement): Statement {
  if (
    !(statement.value instanceof Date) ||
    typeof statement.value !== 'string'
  ) {
    return statement;
  }

  const date = new Date(statement.value);

  if (!isDateValid(date)) return statement;

  statement.value = String(convertDateToUnix(date));

  return statement;
}

export function dateConverterToSqliteDriver(knex: Knex) {
  knex.on('start', (builder: ContextType) => {
    const convertedStatements = builder._statements?.map(
      parseValueToUnixTimestamp
    );

    builder._statements = convertedStatements;
  });

  return knex;
}
