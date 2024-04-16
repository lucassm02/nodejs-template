import { DoneFuncWithErrOrRes, FastifyReply, FastifyRequest } from 'fastify';

import { Controller, HttpRequest, Middleware } from '@/presentation/protocols';

import { Route as RouteClass } from './route';

export type Callback = () => unknown | Promise<unknown>;

export type DefaultFastifyCallback = (
  req: FastifyRequest,
  res: FastifyReply,
  next: DoneFuncWithErrOrRes
) => void;

export type CallbackWithStateHook = (
  req: HttpRequest,
  res: FastifyReply,
  next: Function,
  stateHook: [Record<string, unknown>, Function]
) => void;

export type RouteMiddleware =
  | Controller
  | Middleware
  | CallbackWithStateHook
  | Function;

export const SHARED_STATE_SYMBOL = Symbol('SharedState');

export type Route = RouteClass;

export const STATE_KEY = Symbol('STATE');
export const REPLY_KEY = Symbol('REPLY');
export const REQUEST_KEY = Symbol('REQUEST');

export type State = Record<string, unknown>;
export type Payload = { [REQUEST_KEY]: HttpRequest } & {
  [key: string | symbol]: State;
} & { [REPLY_KEY]: FastifyReply };

export interface Router {
  post(path: string, handler: Function): void;
  put(path: string, handler: Function): void;
  patch(path: string, handler: Function): void;
  get(path: string, handler: Function): void;
  delete(path: string, handler: Function): void;
  options(path: string, handler: Function): void;
}
