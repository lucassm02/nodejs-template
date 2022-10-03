import { MqSendExampleReprocessing } from '@/data/usecases/mq';
import { rabbitMqServer } from '@/infra/mq/utils';
import { REPROCESSING } from '@/util';

const mqServer = rabbitMqServer();

const skipMiddleware = (
  reprocessingState: any,
  middleware: string
): boolean => {
  return (
    reprocessingState &&
    reprocessingState.middleware &&
    reprocessingState.middleware !== middleware
  );
};

type Options = {
  middlewareName: string;
  maxTries?: number;
  delays?: number[];
  queueOptions: {
    exchange: string;
    routingKey?: string;
  };
};

export function reprocessing(options: Options) {
  return function (
    target: Object,
    key: string | symbol,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = function (
      ...args: [Record<string, any>, [Record<string, any>, Function], Function]
    ) {
      const delays = options.delays ?? REPROCESSING.DELAYS;
      const maxTries = options.maxTries ?? REPROCESSING.MAX_TRIES;

      const mqSendExampleReprocessing = new MqSendExampleReprocessing(
        mqServer,
        options.queueOptions,
        maxTries,
        delays
      );

      const [payload, [state], next] = args;

      try {
        if (skipMiddleware(state.reprocessing, options.middlewareName)) {
          return next();
        }

        return originalMethod.apply(this, args);
      } catch (error) {
        mqSendExampleReprocessing.reprocess({
          middleware: options.middlewareName,
          tries: state?.reprocessing?.tries,
          progress: { step: error?.step, total: error?.total },
          data: { state, payload },
        });
      }
    };

    return descriptor;
  };
}
