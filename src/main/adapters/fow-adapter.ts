type Next = (callback?: () => void) => Promise<void>;
export type Callback<T> = (payload: T, next: Function | Next) => void;

export default <T>(payload: T) =>
  (...args: Callback<T>[] | Function[]) =>
  async () => {
    const [launcher] = args
      .reverse()
      .reduce((callbacks: Function[], callback: Function, index) => {
        if (index === 0) {
          return [
            async () =>
              callback(payload, async (fun?: Next) => {
                await fun?.();
              }),
          ];
        }

        const previousFunction = callbacks?.[index - 1];

        return [...callbacks, () => callback(payload, previousFunction)];
      }, [])
      .reverse();

    await launcher?.();
  };
