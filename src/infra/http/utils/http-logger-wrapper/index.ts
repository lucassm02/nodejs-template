import { logger } from '@/util';

type Options = {
  description: string;
  keywords: Record<string, unknown>;
  services: string[];
  request: { body: unknown; method: string; headers: unknown; url: string };
  response: { body?: unknown; statusCode: number; headers?: unknown };
};

export const httpLoggerWrapper = ({
  response,
  request,
  description,
  keywords,
  services,
}: Options) => {
  const requestEntities = {
    'request-body': request.body,
    'request-method': request.method,
    'request-headers': request.headers,
    'request-url': request.url,
  };

  const responseEntities = {
    'response-body': response.body,
    'response-status-code': response.statusCode,
    'response-headers': response.headers,
  };

  logger.log({
    level: 'http',
    message: description,
    meta: { keywords, services },
    payload: {
      request: requestEntities,
      response: responseEntities,
    },
  });
};
