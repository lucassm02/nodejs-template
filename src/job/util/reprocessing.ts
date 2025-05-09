// TODO: We should seek better alternatives in the future, but for now, it's not a problem.
/* eslint-disable @typescript-eslint/no-explicit-any */
import { MqSendReprocessing } from '@/data/usecases/mq';
import { ReprocessingRepository } from '@/infra/db/mongodb/reprocessing';
import { rabbitMqServer } from '@/infra/mq/utils';
import { overrideState } from '@/job/util';
import { REPROCESSING } from '@/util';

const mqServer = rabbitMqServer();
const reprocessingRepository = new ReprocessingRepository();

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

export const normalizeReprocessingPayload = (
  payload: Record<string, any>,
  [state, setState]: [Record<string, any>, Function]
) => {
  if (!payload.body?.reprocessing) return;

  if (payload.body.reprocessing && !state.reprocessing)
    setState({ reprocessing: payload.body.reprocessing });

  overrideState(state, payload.body.reprocessing.data.state);
  payload.headers = payload.body.reprocessing?.data.payload.headers;
  payload.body = payload.body.reprocessing.data.payload.body;
};

type Options = {
  maxTries?: number;
  delays?: number[];
  normalizeOnly?: boolean;
  queueOptions?: {
    exchange: string;
    routingKey?: string;
  };
};

type Args = [Record<string, any>, [Record<string, any>, Function], Function];

// TODO: REFACTOR THIS
export function reprocessing(options: Options = {}) {
  return function (
    target: object,
    _key: string | symbol,
    descriptor: PropertyDescriptor
  ) {
    const originalHandler = descriptor.value;
    const isAsync = originalHandler.constructor.name === 'AsyncFunction';

    if (isAsync) {
      descriptor.value = async function (...args: Args) {
        const [payload, [state, setState], next] = args;

        const delays = options.delays ?? REPROCESSING.DELAYS;
        const maxTries = options.maxTries ?? REPROCESSING.MAX_TRIES;

        const queueOptions = options.queueOptions ?? {
          exchange: payload.fields.exchange,
          routingKey: payload.fields.routingKey
        };

        const mqSendReprocessing = new MqSendReprocessing(
          mqServer,
          mqServer,
          reprocessingRepository,
          { queue: payload.fields.queue, ...queueOptions },
          maxTries,
          delays
        );

        try {
          normalizeReprocessingPayload(payload, [state, setState]);

          if (
            skipMiddleware(state.reprocessing, target.constructor.name) &&
            REPROCESSING.MODE === 'STOPPED_MIDDLEWARE'
          ) {
            return next();
          }

          setState({
            reprocessing: { ...state.reprocessing, middleware: null }
          });

          const result = await originalHandler.apply(this, args);

          return result;
        } catch (error) {
          if (!REPROCESSING.ENABLED || options.normalizeOnly) return;
          mqSendReprocessing.reprocess({
            middleware: target.constructor.name,
            tries: state?.reprocessing?.tries,
            progress: {
              step: error?.step,
              total: error?.total
            },
            data: { state, payload }
          });
        }
      };

      return descriptor;
    }

    descriptor.value = function (...args: Args) {
      const [payload, [state, setState], next] = args;

      const delays = options.delays ?? REPROCESSING.DELAYS;
      const maxTries = options.maxTries ?? REPROCESSING.MAX_TRIES;

      const queueOptions = options.queueOptions ?? {
        exchange: payload.fields.exchange,
        routingKey: payload.fields.routingKey
      };

      const mqSendReprocessing = new MqSendReprocessing(
        mqServer,
        mqServer,
        reprocessingRepository,
        { queue: payload.fields.queue, ...queueOptions },
        maxTries,
        delays
      );

      try {
        normalizeReprocessingPayload(payload, [state, setState]);

        if (
          skipMiddleware(state.reprocessing, target.constructor.name) &&
          REPROCESSING.MODE === 'STOPPED_MIDDLEWARE'
        ) {
          return next();
        }

        setState({
          reprocessing: { ...state.reprocessing, middleware: null }
        });

        const result = originalHandler.apply(this, args);

        return result;
      } catch (error) {
        if (!REPROCESSING.ENABLED || options.normalizeOnly) return;
        mqSendReprocessing.reprocess({
          middleware: target.constructor.name,
          tries: state?.reprocessing?.tries,
          progress: {
            step: error?.step,
            total: error?.total
          },
          data: { state, payload }
        });
      }
    };

    return descriptor;
  };
}
