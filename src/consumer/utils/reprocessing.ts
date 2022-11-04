import { overrideState } from '@/consumer/utils';
import { MqSendReprocessing } from '@/data/usecases/mq';
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

const normalizePayload = (
  payload: Record<string, any>,
  [state, setState]: [Record<string, any>, Function]
) => {
  if (!payload.body.reprocessing) return;

  if (payload.body.reprocessing && !state.reprocessing)
    setState({ reprocessing: payload.body.reprocessing });

  overrideState(state, payload.body.reprocessing.data.state);
  payload.headers = payload.body.reprocessing?.data.payload.headers;
  payload.body = payload.body.reprocessing.data.payload.body;
};

type Options = {
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

    descriptor.value = async function (
      ...args: [Record<string, any>, [Record<string, any>, Function], Function]
    ) {
      const delays = options.delays ?? REPROCESSING.DELAYS;
      const maxTries = options.maxTries ?? REPROCESSING.MAX_TRIES;

      const mqSendReprocessing = new MqSendReprocessing(
        mqServer,
        options.queueOptions,
        maxTries,
        delays
      );

      const [payload, [state, setState], next] = args;

      try {
        normalizePayload(payload, [state, setState]);

        if (skipMiddleware(state.reprocessing, target.constructor.name)) {
          return next();
        }

        setState({
          reprocessing: { ...state.reprocessing, middleware: null },
        });

        const result = await originalMethod.apply(this, args);

        return result;
      } catch (error) {
        if (!REPROCESSING.ENABLED) return;
        mqSendReprocessing.reprocess({
          middleware: target.constructor.name,
          tries: state?.reprocessing?.tries,
          progress: {
            step: error?.step,
            total: error?.total,
          },
          data: { state, payload },
        });
      }
    };

    return descriptor;
  };
}
