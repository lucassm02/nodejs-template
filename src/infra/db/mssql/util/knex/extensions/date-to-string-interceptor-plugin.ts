import k from 'knex';
import { format } from 'date-fns';

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

const convertValueIfIsADate = (value: unknown) => {
  if (value instanceof Date) {
    return format(value, 'yyyy-MM-dd HH:mm:ss');
  }
  return value;
};

function statementsDataToStringInterceptor(data: Statement[]) {
  return data.map((item) => {
    const isNotAWhereGrouping = !item.grouping.includes('where');
    if (isNotAWhereGrouping) return item;
    if (Array.isArray(item.value)) {
      const newValues = item.value.map(convertValueIfIsADate);
      item.value = newValues;
    } else {
      item.value = convertValueIfIsADate(item.value);
    }
    return item;
  });
}

function singleDataToStringInterceptor(data: Record<string, unknown>) {
  if (!data) return;

  const entries = Object.entries(data);

  const newEntries = entries.map(([key, value]) => {
    if (value instanceof Date) {
      const dateToString = format(value, 'yyyy-MM-dd HH:mm:ss');
      return [key, dateToString];
    }

    return [key, value];
  });

  return Object.fromEntries(newEntries);
}

export function dateToStringInterceptorPlugin(knex: typeof k) {
  type ContextType = {
    _single?: {
      table: string;
      insert?: Record<string, unknown>;
      update?: Record<string, unknown>;
      only: boolean;
    };
    _statements?: Statement[];
  };

  const knexProxy = new Proxy(knex, {
    apply(target, _, argArray) {
      const instance = target(argArray[0]);

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

        if (builder._statements) {
          builder._statements = statementsDataToStringInterceptor(
            builder._statements
          );
        }
      });

      return instance;
    }
  });

  return knexProxy;
}
