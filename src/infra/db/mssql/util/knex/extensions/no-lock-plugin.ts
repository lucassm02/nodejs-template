import k from 'knex';

import { getCurrentDrive } from '../utils';

const ALlOWED_DRIVERS = ['MSSQL'];

export function noLockPlugin(knex: typeof k) {
  type ContextType<Type> = { _single: { table: string } } & Type;

  knex.QueryBuilder.extend('noLock', function () {
    if (!ALlOWED_DRIVERS.includes(getCurrentDrive(this.client.config)))
      return this;

    const context = <ContextType<typeof this>>this;
    const table = context._single?.table ?? '';
    return this.from(this.client.raw('?? WITH (NOLOCK)', [table]));
  });

  knex.QueryBuilder.extend('noLockFrom', function (from: string) {
    if (!ALlOWED_DRIVERS.includes(getCurrentDrive(this.client.config)))
      return this.from(from);

    return this.from(this.client.raw('?? WITH (NOLOCK)', [from]));
  });

  knex.QueryBuilder.extend('noLockInnerJoin', function (...args) {
    if (!ALlOWED_DRIVERS.includes(getCurrentDrive(this.client.config)))
      return this.innerJoin(args[0], args[1], args[2]);

    return this.innerJoin(
      this.client.raw('?? WITH (NOLOCK)', args[0]),
      args[1],
      args[2]
    );
  });

  knex.QueryBuilder.extend('noLockLeftJoin', function (...args) {
    if (!ALlOWED_DRIVERS.includes(getCurrentDrive(this.client.config)))
      return this.leftJoin(args[0], args[1], args[2]);

    return this.leftJoin(
      this.client.raw('?? WITH (NOLOCK)', args[0]),
      args[1],
      args[2]
    );
  });

  return knex;
}
