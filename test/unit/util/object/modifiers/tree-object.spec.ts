import { treeObject } from '@/util/object/modifiers/tree-object';

describe('treeObject', () => {
  it('should group prefixed keys into nested child object', () => {
    const input = {
      id: 1,
      addressStreet: 'Main St',
      addressCity: 'Springfield',
      name: 'test'
    };
    const result = treeObject(input, { child: 'address', exception: 'id' });
    expect(result).toEqual({
      name: 'test',
      id: 1,
      address: { street: 'Main St', city: 'Springfield' }
    });
  });

  it('should lowercase the first character of child keys after removing prefix', () => {
    const input = { id: 'x', itemFoo: 'bar', itemBaz: 'qux' };
    const result = treeObject(input, { child: 'item', exception: 'id' });
    expect(result).toEqual({
      id: 'x',
      item: { foo: 'bar', baz: 'qux' }
    });
  });

  it('should keep exception key at root level', () => {
    const input = { total: 99, detailA: 1, detailB: 2 };
    const result = treeObject(input, { child: 'detail', exception: 'total' });
    expect(result.total).toBe(99);
    expect((result as any).detail).toEqual({ a: 1, b: 2 });
  });
});
