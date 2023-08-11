import k from 'knex';

const DELIMITER = '.#@KNEX@#.';

function getValuesPath(object: Object) {
  const paths: { path: string; value: unknown }[] = [];

  function getPath(object: Object, previousPath?: string) {
    return Object.entries(object).forEach(([key, value]) => {
      const path = previousPath ? [previousPath, key].join(DELIMITER) : key;

      if (typeof value === 'object' && !(value instanceof Date)) {
        getPath(value, path);
        return;
      }

      paths.push({ path, value });
    });
  }

  getPath(object);

  return paths;
}

function transformResponseValues(result: Object[] | Object) {
  function parseValue(item: Object) {
    if (!item) return item;
    const object: Record<string, unknown> = {};
    const entries = Object.entries(item);

    for (const [key, value] of entries) {
      if (key.includes(DELIMITER)) {
        const pathChunks = key.split(DELIMITER);

        pathChunks.reduce((acc: Record<string, any>, curr, index) => {
          if (typeof acc === 'undefined') acc = {};

          if (pathChunks.length === index + 1) {
            acc[curr] = value;
          }

          if (typeof acc[curr] === 'undefined') acc[curr] = {};

          return acc[curr];
        }, object);

        continue;
      }

      object[key] = value;
    }

    return object;
  }

  if (Array.isArray(result)) {
    const records = [];
    for (const item of result) {
      records.push(parseValue(item));
    }
    return records;
  }
  return parseValue(result);
}

export function formattedSelectPlugin(knex: typeof k) {
  knex.QueryBuilder.extend('formattedSelect', function (schema: Object) {
    const paths = getValuesPath(schema);
    const entries = paths.map(({ path, value }) => [path, value]);
    const selectObject = Object.fromEntries(entries);
    return this.select(selectObject);
  });

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
                      (data: Object | Object[]) => {
                        resolve(transformResponseValues(data));
                      },
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
