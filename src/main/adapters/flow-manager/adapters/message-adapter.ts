import makeFlow from '@/main/adapters/fow-adapter';

type Payload = {
  payload: Record<string, unknown>;
  state: Record<string, unknown>;
  ack: Function;
};

export const messageAdapter = (
  ...args: (Function | { handle: Function })[]
) => {
  return async (
    payload: Record<string, unknown>,
    state: Record<string, unknown>,
    topLevelNext: Function
  ) => {
    let proceedWithFlow = false;

    const jobs = args.map((job, index) => {
      return ({ payload, state }: Payload, next: Function) => {
        const nextDecorator = () => {
          if (jobs.length - 1 === index) {
            proceedWithFlow = true;
          }

          return next();
        };

        if (typeof job === 'function')
          return job(payload, state, nextDecorator);

        return job.handle(payload, state, nextDecorator);
      };
    });

    await makeFlow({ state, payload, next: topLevelNext })(...jobs)();
    if (!proceedWithFlow) return;
    return topLevelNext();
  };
};
