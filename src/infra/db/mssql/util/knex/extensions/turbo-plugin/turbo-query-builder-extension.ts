import k from 'knex';

export function turboQueryBuilderExtension(knex: typeof k) {
  try {
    knex.QueryBuilder.extend('turbo', function () {
      this._turbo = true;
      return this;
    });
  } catch (_) {
    // method already registered, skip
  }

  return knex;
}
