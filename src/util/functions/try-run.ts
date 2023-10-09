export async function tryToRun(callback: Function | unknown) {
  if (typeof callback !== 'function') {
    return callback;
  }
  const result = await callback();
  return result;
}
