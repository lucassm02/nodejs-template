import { sanitizedParams } from '@/util/observability/loggers/default/formats/utils';

describe('sanitizedParams', () => {
  it('should remove newlines from string values', () => {
    const result = sanitizedParams({ message: 'line1\nline2' });
    expect(result.message).toBe('line1line2');
  });

  it('should remove carriage returns from string values', () => {
    const result = sanitizedParams({ message: 'line1\rline2' });
    expect(result.message).toBe('line1line2');
  });

  it('should remove 4-space sequences from string values', () => {
    const result = sanitizedParams({ message: 'a    b' });
    expect(result.message).toBe('ab');
  });

  it('should leave non-string values unchanged', () => {
    const result = sanitizedParams({ count: 42, flag: true, obj: { a: 1 } });
    expect(result.count).toBe(42);
    expect(result.flag).toBe(true);
    expect(result.obj).toEqual({ a: 1 });
  });

  it('should handle empty object', () => {
    const result = sanitizedParams({});
    expect(result).toEqual({});
  });

  it('should process multiple string keys', () => {
    const result = sanitizedParams({ a: 'hello\nworld', b: 'foo\r\nbar' });
    expect(result.a).toBe('helloworld');
    expect(result.b).toBe('foobar');
  });
});
