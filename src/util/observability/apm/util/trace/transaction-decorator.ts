import { Transaction } from 'elastic-apm-node';

import { getName, labelParamsToString, searchLabels } from './util';
import { elasticAPM } from '../../factory';
import { TraceLabels, TransactionOptions } from './types';

type TransactionParams = {
  options: TransactionOptions;
  params?: TraceLabels;
  result?: TraceLabels;
};

export function apmTransaction({ options, params, result }: TransactionParams) {
  return function (
    _target: object,
    _key: string | symbol,
    descriptor: PropertyDescriptor
  ) {
    const setParams = (
      params: TraceLabels,
      args: unknown[],
      instanceOfTransaction: Transaction
    ) => {
      const labels = searchLabels(params, args);
      const labelsToString = labelParamsToString(labels);
      instanceOfTransaction.addLabels(labelsToString, true);
    };
    const setResult = (
      result: TraceLabels,
      response: unknown,
      instanceOfTransaction: Transaction
    ) => {
      const labels = searchLabels(result, response);
      const labelsToString = labelParamsToString(labels);
      instanceOfTransaction.addLabels(labelsToString, true);
    };
    const apm = elasticAPM().getAPM();

    const originalHandler = descriptor.value;
    const isAsync = originalHandler.constructor.name === 'AsyncFunction';

    if (isAsync) {
      descriptor.value = async function <T>(...args: T[]) {
        const transactionName = getName(args, options);
        const transaction = apm?.startTransaction(transactionName);

        const response = await originalHandler.apply(this, args);

        if (!transaction) return response;

        if (options.type) transaction.type = options.type;

        if (params) {
          setParams(params, args, transaction);
        }

        if (!result) {
          transaction.end();
          return response;
        }

        setResult(result, response, transaction);

        transaction.end();

        return response;
      };

      return descriptor;
    }

    descriptor.value = function <T>(...args: T[]) {
      const transactionName = getName(args, options);
      const response = originalHandler.apply(this, args);

      const transaction = apm?.startTransaction(transactionName);

      if (!transaction) return response;

      if (options.type) transaction.type = options.type;

      if (params) {
        setParams(params, args, transaction);
      }

      if (!result) {
        transaction.end();
        return response;
      }

      setResult(result, response, transaction);

      transaction.end();

      return response;
    };

    return descriptor;
  };
}
