// TODO: We should seek better alternatives in the future, but for now, it's not a problem.
/* eslint-disable @typescript-eslint/no-explicit-any */
import { TraceLabels, TransactionOptions } from '../protocols';

export const searchLabels = (
  labels: TraceLabels | undefined,
  args: any | undefined
): object => {
  const labelsValueToKey = new Map(
    Object.entries(labels ?? {}).map(([k, v]) => [String(v), k])
  );

  function search(obj: any): object {
    return Object.entries(obj ?? {}).reduce(
      (acc: Record<string, unknown>, [key, value]) => {
        const labelKey = labelsValueToKey.get(key);

        if (!labelKey) {
          if (typeof value === 'object' || Array.isArray(value)) {
            Object.assign(acc, search(value));
          }
          return acc;
        }

        acc[labelKey] = value;
        return acc;
      },
      {}
    );
  }

  return search(args);
};

export const labelParamsToString = (params: object) => {
  return Object.entries(params).reduce(
    (acc: Record<string, string | number | boolean>, [key, value]) => {
      acc[key] =
        typeof value === 'object' || Array.isArray(value)
          ? JSON.stringify(value)
          : (value as string | number | boolean);
      return acc;
    },
    {}
  );
};

export const getName = (args: any[], options: TransactionOptions) => {
  if (args?.[options.nameByParameter as any])
    return args[options.nameByParameter as any];

  const findObject = args.find(
    (value) => value?.[options.nameByParameter as any]
  );

  if (findObject) return findObject[options.nameByParameter as any];

  return options.name || 'unnamed';
};

const SUBTYPE_TO_TYPE = new Map<string, string>([
  ['inferred', 'app'],
  ['controller', 'app'],
  ['graphql', 'app'],
  ['mailer', 'app'],
  ['resource', 'app'],
  ['handler', 'app'],
  ['worker', 'app'],
  ['task', 'app'],
  ['function', 'app'],
  ['cassandra', 'db'],
  ['cosmos-bd', 'db'],
  ['db2', 'db'],
  ['derby', 'db'],
  ['dynamodb', 'db'],
  ['elasticsearch', 'db'],
  ['h2', 'db'],
  ['hsqldb', 'db'],
  ['ingres', 'db'],
  ['mariadb', 'db'],
  ['memcached', 'db'],
  ['mongodb', 'db'],
  ['mssql', 'db'],
  ['mysql', 'db'],
  ['oracle', 'db'],
  ['postgresql', 'db'],
  ['redis', 'db'],
  ['sqlite', 'db'],
  ['sqlite3', 'db'],
  ['sql-server', 'db'],
  ['unknown', 'db'],
  ['dubbo', 'external'],
  ['grpc', 'external'],
  ['http', 'external'],
  ['parse', 'json'],
  ['generate', 'json'],
  ['azure-queue', 'messaging'],
  ['azure-service-bus', 'messaging'],
  ['jms', 'messaging'],
  ['kafka', 'messaging'],
  ['rabbitmq', 'messaging'],
  ['sns', 'messaging'],
  ['sqs', 'messaging'],
  ['azure-blob', 'storage'],
  ['azure-file', 'storage'],
  ['azure-table', 'storage'],
  ['s3', 'storage'],
  ['send', 'websocket']
]);

export const getType = (subType: string | null | undefined): string | void => {
  if (!subType) return;
  return SUBTYPE_TO_TYPE.get(subType);
};
