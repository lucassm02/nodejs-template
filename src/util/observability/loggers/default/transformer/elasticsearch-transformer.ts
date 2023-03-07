import pkg from '@/../package.json';

type Param = {
  message: string;
  level: string;
  meta: {
    [key: string]: {
      [key: string]: unknown;
    };
  };
  timestamp?: string;
};

export const elasticSearchTransformer = (param: Param) => {
  const { application: _, meta, ...payload } = param.meta;

  return {
    application: {
      name: pkg.name,
      version: pkg.version ?? null,
    },
    level: param.level,
    message: param.message,
    keywords: meta?.keywords ?? {},
    payload,
    services: meta?.services ?? [],
    created_at: new Date(),
  };
};
