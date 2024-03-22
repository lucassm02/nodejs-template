import { AxiosRequestConfig, RawAxiosRequestHeaders } from 'axios';
import http from 'http';
import https from 'https';

export type HttpRequest = {
  url: AxiosRequestConfig['url'];
  method: AxiosRequestConfig['method'];
  body?: AxiosRequestConfig['data'];
  headers?: RawAxiosRequestHeaders;
  auth?: AxiosRequestConfig['auth'];
  httpAgent?: http.Agent;
  httpsAgent?: https.Agent;
  signal?: AbortSignal;
};

export interface HttpClient<R = any> {
  request: (data: HttpRequest) => Promise<HttpResponse<R>>;
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

export type HttpResponse<T = any> = {
  statusCode: HttpStatusCode;
  body?: T;
  headers?: any;
};
