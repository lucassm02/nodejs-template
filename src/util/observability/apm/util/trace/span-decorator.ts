import { Span } from 'elastic-apm-node';

import { getName, getType, labelParamsToString, searchLabels } from './util';
import { elasticAPM } from '../../factory';
import { SpanOptions, TraceLabels } from './types';

type TraceParams = {
  options: SpanOptions;
  params?: TraceLabels;
  result?: TraceLabels;
};

export function apmSpan({ options, params, result }: TraceParams) {
  return function (
    _target: object,
    _key: string | symbol,
    descriptor: PropertyDescriptor
  ) {
    const apm = elasticAPM().getAPM();

    const setTypeAndSubtype = (subType: string, instanceOfSpan: Span) => {
      const type = getType(subType);
      if (type) instanceOfSpan.type = type;

      instanceOfSpan.subtype = subType;
    };
    const setParams = (
      params: TraceLabels,
      args: unknown[],
      instanceOfSpan: Span
    ) => {
      const labels = searchLabels(params, args);
      const labelsToString = labelParamsToString(labels);
      instanceOfSpan.addLabels(labelsToString, true);
    };
    const setResult = (
      result: TraceLabels,
      response: unknown,
      instanceOfSpan: Span
    ) => {
      const labels = searchLabels(result, response);
      const labelsToString = labelParamsToString(labels);
      instanceOfSpan.addLabels(labelsToString, true);
    };

    const originalHandler = descriptor.value;
    const isAsync = originalHandler.constructor.name === 'AsyncFunction';

    if (isAsync) {
      descriptor.value = async function <T>(...args: T[]) {
        if (!apm?.currentTransaction) return originalHandler.apply(this, args);

        const spanName = getName(args, options);

        const span = apm.currentTransaction.startSpan(spanName);

        if (!span) return originalHandler.apply(this, args);

        const response = await originalHandler.apply(this, args);

        if (options.subType) {
          setTypeAndSubtype(options.subType, span);
        }

        if (params) {
          setParams(params, args, span);
        }

        if (!result) {
          span.end();
          return response;
        }

        setResult(result, response, span);
        span.end();

        return response;
      };

      return descriptor;
    }

    descriptor.value = function <T>(...args: T[]) {
      if (!apm?.currentTransaction) return originalHandler.apply(this, args);

      const spanName = getName(args, options);

      const span = apm.currentTransaction.startSpan(spanName);

      if (!span) return originalHandler.apply(this, args);

      const response = originalHandler.apply(this, args);

      if (options.subType) {
        setTypeAndSubtype(options.subType, span);
      }

      if (params) {
        setParams(params, args, span);
      }

      if (!result) {
        span.end();
        return response;
      }

      setResult(result, response, span);

      span.end();

      return response;
    };

    return descriptor;
  };
}
