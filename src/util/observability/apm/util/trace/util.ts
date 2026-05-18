// TODO: We should seek better alternatives in the future, but for now, it's not a problem.
/* eslint-disable @typescript-eslint/no-explicit-any */
import { sanitizeObject } from '@/util/security/sanitize-object';

import { TraceLabels, TransactionOptions } from './types';

export const searchLabels = (
  labels: TraceLabels | undefined,
  args: any | undefined
): object => {
  const entries = Object.entries(labels || {});

  const areTheyAllIndices = entries.every(
    ([_, value]) => typeof value === 'number'
  );

  if (areTheyAllIndices) {
    const newEntries = entries.map(([key, index]) => {
      return [key, args[index]];
    });

    return Object.fromEntries(newEntries);
  }

  return Object.entries(args ?? {}).reduce(
    (acc: Record<string, unknown>, [key, value]) => {
      const label = Object.entries(labels ?? {}).find(
        // eslint-disable-next-line eqeqeq
        ([, labelValue]) => labelValue == key
      );

      if (!label) {
        if (typeof value === 'object' || Array.isArray(value)) {
          Object.assign(acc, searchLabels(labels, value));
        }
        return acc;
      }

      acc[label[0]] = value;
      return acc;
    },
    {}
  );
};

export const labelParamsToString = (params: object) => {
  const sanitized = sanitizeObject(params);
  return Object.entries(sanitized).reduce(
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

export const getType = (subType: string): string | void =>
  SUBTYPE_TO_TYPE.get(subType);
