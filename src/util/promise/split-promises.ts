import { randomUUID } from 'crypto';

/* eslint-disable no-plusplus */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-useless-catch */
/* eslint-disable no-promise-executor-return */

type Resolver = 'ALL' | 'ALL_SETTLED' | 'RACE' | 'ANY';

export const splitPromises = async (
  callbacks: (() => Promise<unknown>)[],
  maxRunning: number,
  resolver: Resolver = 'ALL_SETTLED'
) => {
  const handlers = {
    ALL: Promise.all.bind(Promise),
    ALL_SETTLED: Promise.allSettled.bind(Promise),
    RACE: Promise.race.bind(Promise),
    ANY: Promise.any.bind(Promise)
  };

  const promiseHandler = handlers[resolver] as unknown as (
    iterable: Promise<unknown>[]
  ) => Promise<unknown>;

  const outputs: { result: unknown; index: number }[] = [];

  const callbackList = new Map();

  const makeWrapper = (id: string) => async () => {
    try {
      const { index, callback } = callbackList.get(id);

      const result = await callback();

      outputs.push({ result, index });
    } catch (error) {
      throw error;
    } finally {
      callbackList.delete(id);
    }
  };

  const callbacksWithWrapper = callbacks.map((callback, index) => {
    const id = randomUUID();
    callbackList.set(id, { callback, index });
    return makeWrapper(id);
  });

  while (callbackList.size > 0) {
    const callbacksToRun = callbacksWithWrapper.splice(
      callbacksWithWrapper.length - maxRunning,
      maxRunning
    );

    const promises = callbacksToRun.map((callback) => callback());
    await promiseHandler(promises);
  }

  return outputs
    .sort((first, second) => first.index - second.index)
    .map(({ result }) => result);
};
