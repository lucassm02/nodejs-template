type Callback = Function | (() => unknown) | unknown | null;

export function tryToRun<C extends Callback, R>(
  callback: C
): C | R | Promise<R> | null {
  if (typeof callback !== 'function') {
    return callback;
  }
  return callback();
}
