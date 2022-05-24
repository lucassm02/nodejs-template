import { NextFunction, Request, Response } from 'express';

type GenericObject = { [key: string]: any };

type LoggerParams = {
  url: string;
  request: GenericObject;
  response: GenericObject;
};

type Logger = (params: LoggerParams) => Promise<void> | void;

export const httpLoggerAdapter =
  (logger: Logger) =>
  (expressRequest: Request, expressResponse: Response, next: NextFunction) => {
    const makeDecorator = (method: Function) => (body: any) => {
      const request = {
        body: expressRequest?.body,
        params: expressRequest?.params,
        query: expressRequest?.query,
        headers: expressRequest?.headers,
      };

      const response = {
        body: JSON.parse(body),
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

      return method.call(expressResponse, body);
    };

    const sendDecorator = makeDecorator(expressResponse.send);

    expressResponse.send = sendDecorator;

    next();
  };
