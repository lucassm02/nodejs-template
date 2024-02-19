import { renameKeys } from '@/util';

describe('renameKeys Function', () => {
  it('should rename keys based on the manifest', () => {
    const input = {
      firstName: 'John',
      lastName: 'Doe',
      age: 25
    };

    const manifest = {
      firstName: 'first',
      lastName: 'last'
    };

    const result = renameKeys(input, manifest);

    expect(result).toEqual({
      first: 'John',
      last: 'Doe',
      age: 25
    });
  });

  it('Should handle an empty object', () => {
    const input = {};

    const manifest = {
      firstName: 'first'
    };

    const result = renameKeys(input, manifest);

    expect(result).toEqual({});
  });

  it('Should handle non-object values', () => {
    const input: any = 'notAnObject';

    const manifest = {
      firstName: 'first'
    };

    const result = renameKeys(input, manifest);

    expect(result).toEqual('notAnObject');
  });

  it('Should handle undefined values', () => {
    const input: any = undefined;

    const manifest = {
      firstName: 'first'
    };

    const result = renameKeys(input, manifest);

    expect(result).toEqual(undefined);
  });
});
