import { PublishInExchangeService } from '@/data/protocols/mq/publish-in-exchange';
import { SendReprocessing } from '@/domain/usecases';

export class MqSendExampleReprocessing implements SendReprocessing {
  constructor(
    private readonly publishInExchangeService: PublishInExchangeService,
    private readonly MAX_TRIES: string,
    private readonly DELAYS: string
  ) {}

  reprocess({
    data: {
      payload,
      state: { reprocessing, ...state },
    },
    middleware,
    progress,
    ...params
  }: SendReprocessing.Params): SendReprocessing.Result {
    const TRIES_SCALE = 1;
    const MINIMUM_DELAY_MULTIPLIER = 2;
    const MAX_TRIES = +this.MAX_TRIES;
    const DELAYS = this.DELAYS.split(',').map((item) => +item);

    const tries = params.tries ?? {
      current: 1,
      max: MAX_TRIES,
      delays: DELAYS,
    };

    const newPayload = {
      reprocessing: {
        middleware,
        progress,
        tries,
        data: { payload, state },
      },
    };

    if (!reprocessing.middleware) {
      const [delay] = DELAYS;

      this.publishInExchangeService.publishInExchange(
        'example-delayed',
        newPayload,
        '',
        {
          'x-delay': delay,
        }
      );
      return;
    }

    const delayIndex = tries.current - 1;

    if (tries.delays.length < tries.max) {
      const newDelay = tries.delays[delayIndex] * MINIMUM_DELAY_MULTIPLIER;

      tries.delays.push(newDelay);
    }

    tries.current += TRIES_SCALE;

    if (tries.current >= tries.max) return;

    this.publishInExchangeService.publishInExchange(
      'example-delayed',
      newPayload,
      '',
      {
        'x-delay': tries.delays[delayIndex],
      }
    );
  }
}
