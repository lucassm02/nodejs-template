import knex from 'knex';

knex.QueryBuilder.extend('noLockFrom', function (from: string) {
  return this.from(this.client.raw(`${from} WITH (NOLOCK)`));
});

knex.QueryBuilder.extend('noLockInnerJoin', function (...args) {
  return this.innerJoin(
    this.client.raw(`${args[0]} WITH (NOLOCK)`),
    args[1],
    args[0]
  );
});

knex.QueryBuilder.extend('noLockLeftJoin', function (...args) {
  return this.leftJoin(
    this.client.raw(`${args[0]} WITH (NOLOCK)`),
    args[1],
    args[0]
  );
});

export default knex;
