/* eslint-disable no-useless-catch */
import EventEmitter from 'events';

type Next = () => void;
export type Callback<Data> = (data: Data, next: Function | Next) => void;

export default <Data extends Record<string, unknown>>(data: Data) =>
  (...callbacks: Callback<Data>[] | Function[]) =>
  async () => {
    const NEXT_EVENT_SYMBOL = Symbol('NEXT');
    const RESOLVER_EVENT_SYMBOL = Symbol('RESOLVE');

    const event = new EventEmitter();

    let resolve!: Function;

    const callStack = callbacks
      .map((middleware) => async () => {
        let nextFunctionWasCalled = false;

        function nextFunction() {
          if (nextFunctionWasCalled) return;
          nextFunctionWasCalled = true;
        }

        try {
          const response = await middleware(data, nextFunction);

          if (nextFunctionWasCalled) {
            event.emit(NEXT_EVENT_SYMBOL);
          }

          return response;
        } catch (error) {
          throw error;
        } finally {
          if (!nextFunctionWasCalled) {
            event.emit(RESOLVER_EVENT_SYMBOL);
          }
        }
      })
      .reverse();

    event.on(NEXT_EVENT_SYMBOL, () => {
      const handler = callStack.pop();

      if (handler === undefined) {
        event.emit(RESOLVER_EVENT_SYMBOL);
        return;
      }

      handler();
    });

    event.once(RESOLVER_EVENT_SYMBOL, () => {
      resolve(undefined);
    });

    return new Promise((resolveCallback, rejectCallback) => {
      try {
        resolve = resolveCallback;
        event.emit(NEXT_EVENT_SYMBOL);
      } catch (error) {
        rejectCallback(error);
      }
    });
  };
