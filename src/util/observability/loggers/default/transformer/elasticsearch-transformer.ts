import pkg from '@/../package.json';
import { convertCamelCaseKeysToSnakeCase } from '@/util/object';

type Param = {
  message: string;
  level: string;
  meta: {
    [key: string]: {
      [key: string]: {
        [key: string]: unknown;
      };
    };
  };
  timestamp?: string;
};

export const elasticSearchTransformer = (param: Param) => {
  const { application: _, traceId, transactionId, payload, meta } = param.meta;

  const data = {
    application: {
      name: pkg.name,
      version: pkg.version ?? null,
    },
    level: param.level,
    message: param.message,
    traceId,
    transactionId,
    payload,
    keywords: meta?.keywords ?? {},
    services: meta?.services ?? [],
    createdAt: new Date(),
  };

  return convertCamelCaseKeysToSnakeCase(data);
};
