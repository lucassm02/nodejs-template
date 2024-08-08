import { DoneFuncWithErrOrRes, FastifyReply, FastifyRequest } from 'fastify';
import fp from 'fastify-plugin';

type LoggerParams = {
  url: string;
  request: Record<string, unknown>;
  response: Record<string, unknown>;
};

type Logger = (params: LoggerParams) => Promise<void> | void;

export const httpLoggerAdapter = (logger: Logger) =>
  fp((fastify, _opts, done) => {
    fastify.addHook(
      'onRequest',
      (
        fastifyRequest: FastifyRequest,
        fastifyResponse: FastifyReply,
        done: DoneFuncWithErrOrRes
      ) => {
        const makeDecorator = (method: Function) => (unknownBody: unknown) => {
          const request = {
            body: fastifyRequest?.body,
            params: fastifyRequest?.params,
            query: fastifyRequest?.query,
            headers: fastifyRequest?.headers
          };

          const body = (() => {
            try {
              if (typeof unknownBody === 'object') return unknownBody;
              if (typeof unknownBody === 'string')
                return JSON.parse(unknownBody);
              return { content: unknownBody };
            } catch (_error) {
              return { content: unknownBody };
            }
          })();

          const response = {
            body,
            headers: fastifyResponse?.getHeaders(),
            code: fastifyResponse.statusCode
          };

          (async () => {
            await logger?.({
              url: fastifyRequest.originalUrl,
              request,
              response
            });
          })();

          return method.call(fastifyResponse, unknownBody);
        };

        const sendDecorator = makeDecorator(fastifyResponse.send);

        fastifyResponse.send = sendDecorator;

        done();
      }
    );
    done();
  });
