import { ErrorHandlerProtocol as Handler } from '@/data/protocols/exception';
import { ExErrorHandler } from '@/data/usecases/exception';
import { logger } from '@/util';

export const makeErrorHandler = (handlers: Handler[] = []) => {
  const defaultErrorHandlers = [(error: Error) => logger.log(error)];
  return new ExErrorHandler([...defaultErrorHandlers, ...handlers]);
};
