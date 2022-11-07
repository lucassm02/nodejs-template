import { ErrorHandler as Handler } from '@/data/protocols/exception';
import { ErrorHandler } from '@/data/usecases/exception';
import { logger } from '@/util';

export const makeErrorHandler = (handlers: Handler[] = []) => {
  const defaultErrorHandlers = [logger.log.bind(logger)];
  return new ErrorHandler([...defaultErrorHandlers, ...handlers]);
};
