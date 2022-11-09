import { getName, getType, labelParamsToString, searchLabels } from '.';
import { elasticAPM } from '../../factory';
import { SpanOptions, traceLabels } from './trace-protocols';

type TraceParams = {
  options: SpanOptions;
  params?: traceLabels;
  result?: traceLabels;
};

export function apmSpan({ options, params, result }: TraceParams) {
  return function (
    target: Object,
    key: string | symbol,
    descriptor: PropertyDescriptor
  ) {
    const apm = elasticAPM().getAPM();

    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const spanName = getName(args, options);

      const span = apm?.currentTransaction?.startSpan(spanName);

      const methodResult = await originalMethod.apply(this, args);

      if (!span) return methodResult;

      if (options?.subType) {
        const type = getType(options.subType);
        if (type) span.type = type;

        span.subtype = options.subType;
      }

      if (params) {
        const labels = searchLabels(params, args);
        const labelsToString = labelParamsToString(labels);
        span.addLabels(labelsToString, true);
      }

      if (result) {
        const labels = searchLabels(result, methodResult);
        const labelsToString = labelParamsToString(labels);
        span.addLabels(labelsToString, true);
      }

      span.end();

      return methodResult;
    };

    return descriptor;
  };
}
