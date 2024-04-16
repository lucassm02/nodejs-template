import { FastifyRequest, RequestGenericInterface } from 'fastify';

export type HttpRequest<
  R extends RequestGenericInterface = {
    Body: Record<string, unknown>;
    Querystring: Record<string, unknown>;
    Params: Record<string, unknown>;
    Headers: Record<string, unknown>;
  }
> = FastifyRequest<R>;

export interface HttpResponse {
  statusCode: number;
  body?: any;
  headers?: any;
}
