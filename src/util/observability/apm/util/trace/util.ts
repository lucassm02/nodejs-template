// TODO: We should seek better alternatives in the future, but for now, it's not a problem.
/* eslint-disable @typescript-eslint/no-explicit-any */
import { TraceLabels, TransactionOptions } from './types';

export const searchLabels = (
  labels: TraceLabels | undefined,
  args: any | undefined
): Object => {
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

  return Object.entries(args ?? {}).reduce((acc, [key, value]) => {
    const label = Object.entries(labels ?? {}).find(
      // eslint-disable-next-line eqeqeq
      ([, labelValue]) => labelValue == key
    );

    if (!label) {
      if (typeof value === 'object' || Array.isArray(value)) {
        return { ...acc, ...searchLabels(labels, value) };
      }
      return acc;
    }

    return { ...acc, [label[0]]: value };
  }, {});
};

export const labelParamsToString = (params: object) => {
  return Object.entries(params).reduce((acc, [key, value]) => {
    if (typeof value === 'object' || Array.isArray(value)) {
      return { ...acc, [key]: JSON.stringify(value) };
    }

    return { ...acc, [key]: value };
  }, {});
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

export const getType = (subType: string): string | void => {
  const types = [
    {
      type: 'app',
      subtypes: [
        'inferred',
        'controller',
        'graphql',
        'mailer',
        'resource',
        'handler',
        'function'
      ]
    },
    {
      type: 'db',
      subtypes: [
        'cassandra',
        'cosmos-bd',
        'db2',
        'derby',
        'dynamodb',
        'elasticsearch',
        'graphql',
        'h2',
        'hsqldb',
        'ingres',
        'mariadb',
        'memcached',
        'mongodb',
        'mssql',
        'mysql',
        'oracle',
        'postgresql',
        'redis',
        'sqlite',
        'sqlite3',
        'sql-server',
        'unknown'
      ]
    },
    {
      type: 'external',
      subtypes: ['dubbo', 'grpc', 'http']
    },
    {
      type: 'json',
      subtypes: ['parse', 'generate']
    },
    {
      type: 'messaging',
      subtypes: [
        'azure-queue',
        'azure-service-bus',
        'jms',
        'kafka',
        'rabbitmq',
        'sns',
        'sqs'
      ]
    },
    {
      type: 'storage',
      subtypes: ['azure-blob', 'azure-file', 'azure-table', 's3']
    },
    {
      type: 'websocket',
      subtypes: ['send']
    },
    {
      type: 'worker',
      subtypes: ['task']
    }
  ];

  for (const type of types) {
    if (type.subtypes.includes(subType)) return type.type;
  }
};
