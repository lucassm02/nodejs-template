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
    const originalHandler = descriptor.value;
    const isAsync = originalHandler.constructor.name === 'AsyncFunction';

    if (isAsync) {
      descriptor.value = async function <T>(...args: T[]) {
        const apm = elasticAPM().getAPM();
        const transactionName = getName(args, options);
        const transaction = apm?.startTransaction(transactionName);

        if (options.type && transaction) transaction.type = options.type;

        try {
          const response = await originalHandler.apply(this, args);

          if (!transaction) return response;

          if (params) {
            setParams(params, args, transaction);
          }

          if (result) setResult(result, response, transaction);

          return response;
        } finally {
          transaction?.end();
        }
      };

      return descriptor;
    }

    descriptor.value = function <T>(...args: T[]) {
      const apm = elasticAPM().getAPM();
      const transactionName = getName(args, options);
      const transaction = apm?.startTransaction(transactionName);

      if (options.type && transaction) transaction.type = options.type;

      try {
        const response = originalHandler.apply(this, args);

        if (!transaction) return response;

        if (params) {
          setParams(params, args, transaction);
        }

        if (result) setResult(result, response, transaction);

        return response;
      } finally {
        transaction?.end();
      }
    };

    return descriptor;
  };
}
