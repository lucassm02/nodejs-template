import type { Knex } from 'knex';

export function getCurrentDrive(config: Knex.Config) {
  return String(config.client).toUpperCase();
}

export const isDateValid = (date: Date): boolean => {
  if (date instanceof Date && !Number.isNaN(date.getTime())) return true;
  return false;
};

export const convertDateToUnix = (date: Date): number => {
  return Math.floor(date.getTime() / 1000);
};
