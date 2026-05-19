import { overrideAttributeValue } from '@/util/object/modifiers/override-attribute-value';

describe('overrideAttributeValue', () => {
  it('should rename copyFrom key to attribute and remove original copyFrom', () => {
    const input = { id: 1, oldName: 'value', other: 'x' };
    const result = overrideAttributeValue({
      from: input,
      attribute: 'name',
      copyFrom: 'oldName'
    });
    expect(result).toEqual({ id: 1, other: 'x', name: 'value' });
  });

  it('should process an array of objects', () => {
    const input = [
      { id: 1, oldName: 'foo' },
      { id: 2, oldName: 'bar' }
    ];
    const result = overrideAttributeValue({
      from: input as any,
      attribute: 'name' as any,
      copyFrom: 'oldName' as any
    });
    expect(result).toEqual([
      { id: 1, name: 'foo' },
      { id: 2, name: 'bar' }
    ]);
  });

  it('should return primitive value unchanged', () => {
    const result = overrideAttributeValue({
      from: 'not-an-object' as any,
      attribute: 'a' as any,
      copyFrom: 'b' as any
    });
    expect(result).toBe('not-an-object');
  });

  it('should omit the attribute key if it existed before', () => {
    const input = { name: 'old', slug: 'new-value' };
    const result = overrideAttributeValue({
      from: input,
      attribute: 'name',
      copyFrom: 'slug'
    });
    expect(result).toEqual({ name: 'new-value' });
    expect((result as any).slug).toBeUndefined();
  });
});
