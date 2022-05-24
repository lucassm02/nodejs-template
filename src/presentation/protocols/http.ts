import { Request } from 'express';

export type HttpRequest = Request;

export interface HttpResponse {
  statusCode: number;
  body?: any;
  headers?: any;
}
