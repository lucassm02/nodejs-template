import { SpanOptions, TraceLabels } from './protocols';
import { getName, getType, searchLabels } from './utils';

type LoggerOptions = { inputName: string; outputName: string };

type LoggerParams = {
  options: SpanOptions;
  input?: TraceLabels;
  output?: TraceLabels;
};

export function makeDecorator<Logger extends Function>(
  logger: Logger,
  loggerOptions: LoggerOptions
) {
  return function ({ options, input, output }: LoggerParams) {
    return function (
      _target: object,
      _key: string | symbol,
      descriptor: PropertyDescriptor
    ) {
      const originalHandler = descriptor.value;
      const isAsync = originalHandler.constructor.name === 'AsyncFunction';

      // TODO:  REFACTOR THIS
      if (isAsync) {
        descriptor.value = async function <T>(...args: T[]) {
          const name = getName(args, options);
          const methodResult = await originalHandler.apply(this, args);

          const type = getType(options?.subType) ?? undefined;
          const subType = options?.subType ?? undefined;

          const inputData = searchLabels(input, args);
          const outputData = searchLabels(output, methodResult);

          logger?.({
            name,
            type,
            subType,
            [loggerOptions.inputName]: inputData,
            [loggerOptions.outputName]: outputData
          });

          return methodResult;
        };

        return descriptor;
      }

      descriptor.value = function <T>(...args: T[]) {
        const name = getName(args, options);
        const methodResult = originalHandler.apply(this, args);

        const type = getType(options?.subType) ?? undefined;
        const subType = options?.subType ?? undefined;

        const inputData = searchLabels(input, args);
        const outputData = searchLabels(output, methodResult);

        logger?.({
          name,
          type,
          subType,
          [loggerOptions.inputName]: inputData,
          [loggerOptions.outputName]: outputData
        });

        return methodResult;
      };

      return descriptor;
    };
  };
}
