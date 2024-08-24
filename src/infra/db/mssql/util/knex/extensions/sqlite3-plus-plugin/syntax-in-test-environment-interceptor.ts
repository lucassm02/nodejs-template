import { Knex } from 'knex';

import { ContextType } from '../types';

function removeTableNameOfKeyValue([key, value]: [string, unknown]) {
  if (!key.includes('.')) return [key, value];
  const newKey = key.split('.')[1]; // get prop name
  return [newKey, value];
}

function singleDataRemoveTableInterceptor(data: Record<string, unknown>) {
  if (typeof data !== 'object') return data;

  if (!Array.isArray(data)) {
    const entries = Object.entries(data);
    const newEntries = entries.map(removeTableNameOfKeyValue);
    return Object.fromEntries(newEntries);
  }

  const entries = data.map(Object.entries);
  const newEntries = entries.map((entry) =>
    entry.map(removeTableNameOfKeyValue)
  );

  return newEntries.map(Object.fromEntries);
}

export function syntaxInTestEnvironmentInterceptor(knex: Knex) {
  knex.on('start', (builder: ContextType) => {
    if (!builder) return;

    const PROPS_TO_INTERCEPT = <const>['update', 'insert'];

    for (const prop of PROPS_TO_INTERCEPT) {
      if (builder._single?.[prop]) {
        builder._single[prop] = singleDataRemoveTableInterceptor(
          <Record<string, unknown>>builder._single[prop]
        );
      }
    }
  });
  return knex;
}
