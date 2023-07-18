import Agenda from 'agenda';
import { NextFunction, Request, Response } from 'express';

type Middleware = (req: Request, res: Response, next: NextFunction) => void;
type Options = {
  title?: string;
  middleware?: string;
};

declare module 'agendash' {
  export default function agendash(
    agenda: Agenda | void,
    options: Options
  ): Middleware;
}
