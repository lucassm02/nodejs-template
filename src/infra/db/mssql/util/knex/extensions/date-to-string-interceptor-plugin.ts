import { format } from 'date-fns';
import k, { ContextType } from 'knex';

import { isDateValid } from '@/util';

function formatDateEntries([key, value]: [string, unknown]) {
  if (isDateValid(<Date>value)) {
    const dateToString = format(<Date>value, 'yyyy-MM-dd HH:mm:ss');
    return [key, dateToString];
  }

  return [key, value];
}

function singleDataToStringInterceptor(data: Record<string, unknown>) {
  if (typeof data !== 'object') return data;

  if (Array.isArray(data)) {
    const entries = data.map(Object.entries);
    const newEntries = entries.map((entriesObjects) =>
      entriesObjects.map(formatDateEntries)
    );
    return newEntries.map(Object.fromEntries);
  }

  const entries = Object.entries(data);

  const newEntries = entries.map(formatDateEntries);

  return Object.fromEntries(newEntries);
}

export function dateToStringInterceptorPlugin(knex: typeof k) {
  const knexProxy = new Proxy(knex, {
    apply(target, _, [arg]) {
      const instance = target(arg);

      instance.on('start', (builder: ContextType) => {
        if (!builder) return;

        const PROPS_TO_INTERCEPT = <const>['insert', 'update'];

        for (const prop of PROPS_TO_INTERCEPT) {
          if (builder._single?.[prop]) {
            builder._single[prop] = singleDataToStringInterceptor(
              <Record<string, unknown>>builder._single[prop]
            );
          }
        }
      });

      return instance;
    }
  });

  return knexProxy;
}
