import { workerLogger } from '@/util';

describe('WORKER Logger Function', () => {
  it('should return a decorator with options', async () => {
    const decorator = workerLogger({
      options: {
        name: 'any_name',
        nameByParameter: 'any_name_by_parameter',
        subType: 'worker'
      }
    });
    expect(typeof decorator).toEqual('function');

    const result = decorator({}, '', { value: () => 'result value' });
    expect(typeof result.value).toEqual('function');

    const decoratorValue = await result.value();
    const expected = 'result value';
    expect(decoratorValue).toStrictEqual(expected);
  });
});
