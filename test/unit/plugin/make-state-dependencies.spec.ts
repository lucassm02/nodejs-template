import { makeStateDependencies } from '@/plugin';
import { logger } from '@/util';

describe('Make StateDependenciesDecorator Function', () => {
  it('should return result value when state is not missing', async () => {
    const decorator = makeStateDependencies<{
      any_key: 'any_key';
      any_key_2: 'any_key_2';
    }>({
      trowException: false
    });
    expect(typeof decorator).toEqual('function');

    const result = decorator(['any_key']);
    expect(typeof result).toEqual('function');

    const decoratorValue = result({}, '', { value: () => 'result value' });
    expect(typeof decoratorValue.value).toEqual('function');

    const state = [{ any_key: 'key' }, jest.fn()];
    const decoratorResult = decoratorValue.value('any_value', state);

    const expected = 'result value';
    expect(decoratorResult).toBe(expected);
  });

  it('should log error when state is missing and throwException is false', async () => {
    const logSpy = jest.spyOn(logger, 'log').mockReturnValueOnce();

    const decorator = makeStateDependencies<{
      any_key: 'any_key';
      any_key_2: 'any_key_2';
    }>({
      trowException: false
    });
    expect(typeof decorator).toEqual('function');

    const result = decorator(['any_key']);
    expect(typeof result).toEqual('function');

    const decoratorValue = result({}, '', { value: () => 'result value' });
    expect(typeof decoratorValue.value).toEqual('function');

    const state = {};
    const decoratorResult = decoratorValue.value('any_value', state);

    const expected = 'result value';
    const logError = new Error('MISSING_DEPENDENCY: any_key at Object method ');
    expect(decoratorResult).toBe(expected);
    expect(logSpy).toHaveBeenCalledTimes(1);
    expect(logSpy).toHaveBeenCalledWith(logError);
  });

  it('should throw error when state is missing and throwException is true', async () => {
    const logSpy = jest.spyOn(logger, 'log').mockReturnValueOnce();

    const decorator = makeStateDependencies<{
      any_key: 'any_key';
      any_key_2: 'any_key_2';
    }>({
      trowException: true
    });
    expect(typeof decorator).toEqual('function');

    const result = decorator(['any_key']);
    expect(typeof result).toEqual('function');

    const decoratorValue = result({}, '', { value: () => 'result value' });
    expect(typeof decoratorValue.value).toEqual('function');

    const state = [{}, jest.fn()];
    try {
      decoratorValue.value('any_value', state);
      const logError = new Error(
        'MISSING_DEPENDENCY: any_key at Object method '
      );
      expect(logSpy).toHaveBeenCalledTimes(1);
      expect(logSpy).toHaveBeenCalledWith(logError);
    } catch (error) {
      expect(error.message).toStrictEqual(
        'MISSING_DEPENDENCY: any_key at Object method '
      );
    }
  });

  it('should call exceptionHandler when it is set', async () => {
    const logSpy = jest.spyOn(logger, 'log').mockReturnValueOnce();
    const exceptionHandler = jest.fn();

    const decorator = makeStateDependencies<{
      any_key: 'any_key';
      any_key_2: 'any_key_2';
    }>({
      trowException: false,
      exceptionHandler
    });
    expect(typeof decorator).toEqual('function');

    const result = decorator(['any_key']);
    expect(typeof result).toEqual('function');

    const decoratorValue = result({}, '', { value: () => 'result value' });
    expect(typeof decoratorValue.value).toEqual('function');

    const state = [{}, jest.fn()];
    decoratorValue.value('any_value', state);

    const logError = new Error('MISSING_DEPENDENCY: any_key at Object method ');
    expect(exceptionHandler).toHaveBeenCalledTimes(1);
    expect(exceptionHandler).toHaveBeenCalledWith(logError);
    expect(logSpy).toHaveBeenCalledTimes(1);
    expect(logSpy).toHaveBeenCalledWith(logError);
  });
});
