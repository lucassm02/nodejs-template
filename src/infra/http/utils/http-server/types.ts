import { Controller, Middleware } from '@/presentation/protocols';
import {
  IRouter,
  IRouterHandler,
  IRouterMatcher,
  NextFunction,
  Request,
  Response,
} from 'express';

export type GenericObject = { [key: string]: any };
export type Callback = () => any | Promise<any>;

export type ExpressRoute = IRouterMatcher<IRouter> & IRouterHandler<IRouter>;

export type DefaultExpressCallback = (
  req: Request,
  res: Response,
  next: NextFunction
) => void;

export type CallbackWithStateHook = (
  req: Request,
  res: Response,
  next: NextFunction,
  stateHook: [GenericObject, Function]
) => void;

export type RouteMiddleware =
  | Controller
  | Middleware
  | CallbackWithStateHook
  | Function;
