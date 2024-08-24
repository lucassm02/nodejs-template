import type { Knex } from 'knex';

export function getCurrentDrive(config: Knex.Config) {
  return String(config.client).toUpperCase();
}
