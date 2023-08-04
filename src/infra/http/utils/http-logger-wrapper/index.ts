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
  services
}: Options) => {
  try {
    const requestTypeOf = typeof request?.body;
    const responseTypeOf = typeof response?.body;

    const newRequestBody =
      request?.body && requestTypeOf !== 'object'
        ? { contentType: requestTypeOf, rawRequestBody: request.body }
        : request.body;

    const newResponseBody =
      response?.body && responseTypeOf !== 'object'
        ? { contentType: responseTypeOf, rawResponseBody: response.body }
        : response.body;

    const requestEntities = {
      'request-body': newRequestBody,
      'request-method': request.method,
      'request-headers': request.headers,
      'request-url': request.url
    };

    const responseEntities = {
      'response-body': newResponseBody,
      'response-status-code': response.statusCode,
      'response-headers': response.headers
    };

    logger.log({
      level: 'http',
      message: description,
      meta: { keywords, services },
      payload: {
        request: requestEntities,
        response: responseEntities
      }
    });
  } catch (error) {
    logger.log(error);
  }
};
