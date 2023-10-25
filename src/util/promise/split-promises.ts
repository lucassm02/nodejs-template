import { EventEmitter } from 'node:events';

const RUN_NEXT_PROMISE = Symbol('kRunNextPromise');
const RESOLVE = Symbol('kResolve');

type Callback<T> = () => Promise<T>;

export async function splitPromises<T>(
  callbacks: Callback<T>[],
  maxRunning: number
) {
  let resolveFunction: Function;

  const event = new EventEmitter();
  const outputs: { result: unknown; index: number }[] = [];

  const mainPromise = new Promise((resolve) => {
    resolveFunction = resolve;
  });

  const makeWrapper = (callback: Function, index: number) => async () => {
    try {
      const result = await callback();

      outputs.push({ result, index });
    } catch (error) {
      outputs.push({ result: error, index });
    } finally {
      event.emit(RUN_NEXT_PROMISE);
    }
  };

  const callStack = callbacks
    .map((callback, index) => makeWrapper(callback, index))
    .reverse();

  event.on(RUN_NEXT_PROMISE, async () => {
    const promise = callStack.pop();

    if (!promise) {
      event.emit(RESOLVE);
      return;
    }

    await promise();
  });

  event.on(RESOLVE, async () => {
    if (outputs.length !== callbacks.length) return;

    const result = outputs
      .sort((first, second) => first.index - second.index)
      .map(({ result }) => result);

    resolveFunction(result);
  });

  const indexPosition = callStack.length - maxRunning;
  const startIndex = indexPosition < 0 ? 0 : indexPosition;

  const firstWaveToRun = callStack.splice(startIndex, maxRunning);
  const promises = firstWaveToRun.map((callback) => callback());
  await Promise.allSettled(promises);

  return mainPromise;
}
