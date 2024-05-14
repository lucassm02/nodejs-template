import Agenda from 'agenda';
import { FastifyPluginCallback } from 'fastify';

type Middleware = FastifyPluginCallback;
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
