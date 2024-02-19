import { tryToRun } from '@/util';

describe('tryToRun Function', () => {
  it('Returns the callback when it is not a function', async () => {
    const nonFunctionCallback = 'Not a function';
    const result = await tryToRun(nonFunctionCallback);
    expect(result).toBe(nonFunctionCallback);
  });

  it('Executes the callback correctly when it is a function', async () => {
    const callback = jest.fn(() => Promise.resolve(42));
    const result = await tryToRun(callback);

    expect(callback).toHaveBeenCalled();
    expect(result).toBe(42);
  });

  it('Handles non-function or non-Promise callbacks correctly', async () => {
    const nonFunctionOrPromiseCallback = 123;
    const result = await tryToRun(nonFunctionOrPromiseCallback);

    expect(result).toBe(nonFunctionOrPromiseCallback);
  });
});
