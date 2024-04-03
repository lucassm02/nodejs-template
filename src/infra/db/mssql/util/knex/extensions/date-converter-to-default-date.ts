import k from 'knex';

import { ENVIRONMENT, isDateValid } from '@/util';

function convertToDateValue([key, value]: [string, unknown]): [
  string,
  unknown
] {
  if (!(value instanceof Date) && typeof value !== 'string') {
    return [key, value];
  }

  const date = new Date(value);

  if (!isDateValid(date)) return [key, value];

  return [key, date];
}

export function resolveWrapper(resolve: (data: Object | Object[]) => void) {
  return (data: Object | Object[]) => {
    if (typeof data !== 'object') return resolve(data);

    if (!Array.isArray(data)) {
      const entries = Object.entries(data);
      const newEntries = entries.map(convertToDateValue);
      const formattedData = Object.fromEntries(newEntries);
      return resolve(formattedData);
    }

    const entries = data.map(Object.entries);
    const newEntries = entries.map((entry) => entry.map(convertToDateValue));

    const formattedData = newEntries.map(Object.fromEntries);

    return resolve(formattedData);
  };
}

export function dateConverterToDefaultDate(knex: typeof k) {
  if (ENVIRONMENT.toLowerCase() !== 'test') return knex;

  const knexProxy = new Proxy(knex, {
    apply(target, _, [arg]) {
      const instanceOfKnex = target(arg);

      return new Proxy(instanceOfKnex, {
        apply(target, _, [arg]) {
          const instanceOfQueryBuilder = target(arg);

          return new Proxy(instanceOfQueryBuilder, {
            get(target: any, property) {
              const method = target[property];

              if (property === 'then') {
                return new Proxy(method, {
                  apply(target, thisArg, [resolve, reject]) {
                    const result = target.call(
                      thisArg,
                      resolveWrapper(resolve),
                      reject
                    );

                    return result;
                  }
                });
              }

              return method;
            }
          });
        }
      });
    }
  });

  return knexProxy;
}
