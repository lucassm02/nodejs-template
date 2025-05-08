import { AxiosRequestConfig, RawAxiosRequestHeaders } from 'axios';
import http from 'http';
import https from 'https';

type GenericObject = Record<string, unknown>;

export type Data = {
  url: AxiosRequestConfig['url'];
  method: AxiosRequestConfig['method'];
  body?: AxiosRequestConfig['data'];
  headers?: RawAxiosRequestHeaders;
  auth?: AxiosRequestConfig['auth'];
  httpAgent?: http.Agent;
  httpsAgent?: https.Agent;
  signal?: AbortSignal;
};

export interface HttpClient<
  B extends object = GenericObject,
  H extends object = GenericObject
> {
  request: (data: Data) => Promise<HttpResponse<B, H>>;
}

export enum HttpStatusCode {
  ok = 200,
  created = 201,
  noContent = 204,
  badRequest = 400,
  unauthorized = 401,
  forbidden = 403,
  notFound = 404,
  serverError = 500
}

export type HttpResponse<
  B extends object = GenericObject,
  H extends object = GenericObject
> = {
  statusCode: HttpStatusCode;
  body: B;
  headers: H;
};
