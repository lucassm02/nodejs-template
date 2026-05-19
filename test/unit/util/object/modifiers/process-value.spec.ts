import { processValue } from '@/util/object/modifiers/process-value';

describe('processValue', () => {
  it('should apply transform function to matching key', () => {
    const input = { age: 10, name: 'alice' };
    const result = processValue(input, { age: (v: number) => v * 2 });
    expect(result).toEqual({ age: 20, name: 'alice' });
  });

  it('should leave keys without manifest entry unchanged', () => {
    const input = { a: 1, b: 2 };
    const result = processValue(input, {});
    expect(result).toEqual({ a: 1, b: 2 });
  });

  it('should apply multiple transforms', () => {
    const input = { x: 'hello', y: 5 };
    const result = processValue(input, {
      x: (v: string) => v.toUpperCase(),
      y: (v: number) => v + 1
    });
    expect(result).toEqual({ x: 'HELLO', y: 6 });
  });

  it('should return original value when input is not an object', () => {
    const result = processValue('string' as any, {});
    expect(result).toBe('string');
  });
});
