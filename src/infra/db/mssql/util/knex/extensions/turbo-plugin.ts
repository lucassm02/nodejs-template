import k from 'knex';

import { getCurrentDrive } from '../utils';

const ALLOWED_DRIVERS = ['MSSQL'];

export function turboPlugin(knex: typeof k) {
  knex.QueryBuilder.extend('turbo', function () {
    if (!ALLOWED_DRIVERS.includes(getCurrentDrive(this.client.config)))
      return this;

    this._turbo = true;

    return this;
  });

  return knex;
}
