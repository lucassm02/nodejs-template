import { NextFunction, Request, Response } from 'express';

type LoggerParams = {
  url: string;
  request: Record<string, unknown>;
  response: Record<string, unknown>;
};

type Logger = (params: LoggerParams) => Promise<void> | void;

export const httpLoggerAdapter =
  (logger: Logger) =>
  (expressRequest: Request, expressResponse: Response, next: NextFunction) => {
    const makeDecorator = (method: Function) => (unknownBody: unknown) => {
      const request = {
        body: expressRequest?.body,
        params: expressRequest?.params,
        query: expressRequest?.query,
        headers: expressRequest?.headers,
      };

      const body = (() => {
        try {
          if (typeof unknownBody === 'object') return unknownBody;
          if (typeof unknownBody === 'string') return JSON.parse(unknownBody);
          return { content: unknownBody };
        } catch (_error) {
          return { content: unknownBody };
        }
      })();

      const response = {
        body,
        headers: expressResponse?.getHeaders(),
        code: expressResponse.statusCode,
      };

      (async () => {
        await logger?.({
          url: expressRequest.originalUrl,
          request,
          response,
        });
      })();

      return method.call(expressResponse, unknownBody);
    };

    const sendDecorator = makeDecorator(expressResponse.send);

    expressResponse.send = sendDecorator;

    next();
  };
