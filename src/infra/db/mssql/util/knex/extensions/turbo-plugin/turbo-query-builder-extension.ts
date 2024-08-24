import k from 'knex';

export function turboQueryBuilderExtension(knex: typeof k) {
  knex.QueryBuilder.extend('turbo', function () {
    this._turbo = true;
    return this;
  });

  return knex;
}
