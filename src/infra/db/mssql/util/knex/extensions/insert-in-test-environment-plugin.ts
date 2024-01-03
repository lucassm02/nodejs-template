import k from 'knex';

type Statement = {
  grouping: string;
  type: string;
  column: string;
  operator: string;
  value: unknown;
  not: boolean;
  bool: string;
  asColumn: boolean;
};

type ContextType = {
  _single?: {
    table: string;
    insert?: Record<string, unknown>;
    update?: Record<string, unknown>;
    only: boolean;
  };
  _statements?: Statement[];
};

type Data = Record<string, unknown>[] | Record<string, unknown>;

function removeTableNameOfKeyValue([key, value]: [string, unknown]) {
  if (!key.includes('.')) return [key, value];
  const newKey = key.split('.')[1];
  return [newKey, value];
}

function removeTableFromKeyValue(data: Data) {
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

export function insertInTestEnvironmentInterceptor(knex: typeof k) {
  const knexProxy = new Proxy(knex, {
    apply(target, _, [arg]) {
      const instance = target(arg);
      instance.on('start', (builder: ContextType) => {
        if (!builder) return;

        if (String(process.env.NODE_ENV).toLowerCase() !== 'test') return;

        const PROPS_TO_INTERCEPT = <const>['insert'];

        for (const PROP of PROPS_TO_INTERCEPT) {
          if (builder._single?.[PROP]) {
            builder._single[PROP] = removeTableFromKeyValue(
              <Data>builder._single[PROP]
            );
          }
        }
      });
      return instance;
    }
  });
  return knexProxy;
}
