import { SpanOptions, traceLabels } from './protocols';
import { getName, getType, searchLabels } from './utils';

type LoggerOptions = { inputName: string; outputName: string };

type LoggerParams = {
  options: SpanOptions;
  input?: traceLabels;
  output?: traceLabels;
};

export function makeDecorator<Logger extends Function>(
  logger: Logger,
  loggerOptions: LoggerOptions
) {
  return function ({ options, input, output }: LoggerParams) {
    return function (
      target: Object,
      key: string | symbol,
      descriptor: PropertyDescriptor
    ) {
      const originalMethod = descriptor.value;

      descriptor.value = async function (...args: any[]) {
        const name = getName(args, options);
        const methodResult = await originalMethod.apply(this, args);

        const type = getType(options?.subType) ?? undefined;
        const subType = options?.subType ?? undefined;

        const inputData = searchLabels(input, args);
        const outputData = searchLabels(output, methodResult);

        await logger?.({
          name,
          type,
          subType,
          [loggerOptions.inputName]: inputData,
          [loggerOptions.outputName]: outputData,
        });

        return methodResult;
      };

      return descriptor;
    };
  };
}
