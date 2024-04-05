import { ErrorHandlerProtocol as Handler } from '@/data/protocols/exception';
import { ExErrorHandler } from '@/data/usecases/other/exception';
import { elasticAPM, logger } from '@/util';

export const makeErrorHandler = (handlers: Handler[] = []) => {
  const loggerCallback = (error: Error) => logger.log(error);

  const apmCallback = () =>
    elasticAPM().getAPM()?.setTransactionOutcome('failure');

  const defaultErrorHandlers = [loggerCallback, apmCallback];
  return new ExErrorHandler([...defaultErrorHandlers, ...handlers]);
};
