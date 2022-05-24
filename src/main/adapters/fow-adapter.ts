type NextFunction = (callback?: () => void) => void;
export type Callback<T> = (payload: T, next: Function | NextFunction) => void;

export default <T>(payload: T) =>
  (...args: Callback<T>[] | Function[]) =>
  () => {
    const [launcher] = args
      .reverse()
      .reduce((callbacks: Function[], callback: Function, index) => {
        if (index === 0) {
          return [
            () =>
              callback(payload, (func?: NextFunction) => {
                func?.();
              }),
          ];
        }

        const previousFunction = callbacks?.[index - 1];

        return [...callbacks, () => callback(payload, previousFunction)];
      }, [])
      .reverse();

    launcher?.();
  };
