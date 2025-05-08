import k from 'knex';

const DELIMITER = '.#@KNEX@#.';

function getValuesPath(object: object) {
  const paths: { path: string; value: unknown }[] = [];

  function getPath(object: object, previousPath?: string) {
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

function transformResponse(response: object[] | object) {
  function parseValue(item: object) {
    if (typeof item !== 'object') return item;
    const object: Record<string, unknown> = {};
    const entries = Object.entries(item);

    for (const [key, value] of entries) {
      if (key.includes(DELIMITER)) {
        const pathChunks = key.split(DELIMITER);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

  if (Array.isArray(response)) return response.map(parseValue);

  return parseValue(response);
}

function resolveWrapper(resolve: (data: object | object[]) => void) {
  return (data: object | object[]) => {
    if (typeof data !== 'object') {
      resolve(data);
      return;
    }

    const sample = Array.isArray(data) ? data[0] : data;

    if (!sample) {
      resolve(data);
      return;
    }

    const doesTheSelectHaveNestedObjects = Object.keys(sample).find((key) =>
      key.includes(DELIMITER)
    );

    if (!doesTheSelectHaveNestedObjects) {
      resolve(data);
      return;
    }

    resolve(transformResponse(data));
  };
}

export function formattedSelectPlugin(knex: typeof k) {
  knex.QueryBuilder.extend('formattedSelect', function (schema: object) {
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
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
