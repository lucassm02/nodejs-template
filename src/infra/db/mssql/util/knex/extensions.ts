import knex from 'knex';

type ContextType<Type> = { _single: { table: string } } & Type;

knex.QueryBuilder.extend('noLock', function () {
  const context = <ContextType<typeof this>>this;
  const table = context._single?.table ?? '';
  return this.from(this.client.raw('?? WITH (NOLOCK)', [table]));
});

knex.QueryBuilder.extend('noLockFrom', function (from: string) {
  return this.from(this.client.raw('?? WITH (NOLOCK)', [from]));
});

knex.QueryBuilder.extend('noLockInnerJoin', function (...args) {
  return this.innerJoin(
    this.client.raw('?? WITH (NOLOCK)', args[0]),
    args[1],
    args[2]
  );
});

knex.QueryBuilder.extend('noLockLeftJoin', function (...args) {
  return this.leftJoin(
    this.client.raw('?? WITH (NOLOCK)', args[0]),
    args[1],
    args[2]
  );
});

export default knex;
