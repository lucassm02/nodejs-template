import { getName, labelParamsToString, searchLabels } from '.';
import { elasticAPM } from '../../factory';
import { traceLabels, TransactionOptions } from './trace-protocols';

type TransactionParams = {
  options: TransactionOptions;
  params?: traceLabels;
  result?: traceLabels;
};

export function apmTransaction({ options, params, result }: TransactionParams) {
  return function (
    target: Object,
    key: string | symbol,
    descriptor: PropertyDescriptor
  ) {
    const apm = elasticAPM().getAPM();

    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const transactionName = getName(args, options);

      const transaction = apm?.startTransaction(transactionName);

      const methodResult = await originalMethod.apply(this, args);

      if (!transaction) return methodResult;

      if (options?.type) transaction.type = options?.type;

      if (params) {
        const labels = searchLabels(params, args);
        const labelsToString = labelParamsToString(labels);
        transaction.addLabels(labelsToString, true);
      }

      if (result) {
        const labels = searchLabels(result, methodResult);
        const labelsToString = labelParamsToString(labels);
        transaction.addLabels(labelsToString, true);
      }

      transaction.end();

      return methodResult;
    };

    return descriptor;
  };
}
