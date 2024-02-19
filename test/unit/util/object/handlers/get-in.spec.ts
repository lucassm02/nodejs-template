import { getIn } from '@/util';

describe('getIn Function', () => {
  it('Should return the value at the specified path', () => {
    const object = {
      a: {
        b: {
          c: 'value'
        }
      }
    };

    const result = getIn(object, 'a.b.c');

    expect(result).toEqual('value');
  });

  it.skip('Should handle array indexing', () => {
    const object = {
      array: [
        { id: 1, value: 'first' },
        { id: 2, value: 'second' },
        { id: 3, value: 'third' }
      ]
    };

    const result = getIn(object, 'array[1].value');

    expect(result).toEqual('second');
  });

  it('Should return undefined for non-existing path', () => {
    const object = {
      a: {
        b: {
          c: 'value'
        }
      }
    };

    const result = getIn(object, 'nonexistent.path');

    expect(result).toBeUndefined();
  });

  it('Should handle array indexing with non-existing index', () => {
    const object = {
      array: [
        { id: 1, value: 'first' },
        { id: 2, value: 'second' },
        { id: 3, value: 'third' }
      ]
    };

    const result = getIn(object, 'array[5].value');

    expect(result).toBeUndefined();
  });

  it.skip('Should handle nested array indexing', () => {
    const object = {
      nestedArray: [
        [
          { id: 1, value: 'nested1' },
          { id: 2, value: 'nested2' }
        ],
        [
          { id: 3, value: 'nested3' },
          { id: 4, value: 'nested4' }
        ]
      ]
    };

    const result = getIn(object, 'nestedArray[1][0].value');

    expect(result).toEqual('nested3');
  });
});
