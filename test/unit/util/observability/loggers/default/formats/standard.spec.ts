import { standard } from '@/util/observability/loggers/default/formats/standard';

const applyFormat = (info: Record<string, unknown>): string => {
  return (standard as any).transform(info)[Symbol.for('message')];
};

describe('standard format', () => {
  it('should output JSON with level, message, timestamp when no extra params', () => {
    const output = applyFormat({
      level: 'info',
      message: 'hello',
      timestamp: '2024-01-01 00:00:00'
    });
    const parsed = JSON.parse(output);
    expect(parsed).toEqual({
      level: 'info',
      message: 'hello',
      timestamp: '2024-01-01 00:00:00'
    });
  });

  it('should include extra params before timestamp', () => {
    const output = applyFormat({
      level: 'error',
      message: 'oops',
      timestamp: '2024-01-01',
      extra: 'data'
    });
    const parsed = JSON.parse(output);
    expect(parsed.extra).toBe('data');
    expect(parsed.level).toBe('error');
  });

  it('should sanitize newlines in string values', () => {
    const output = applyFormat({
      level: 'info',
      message: 'line1\nline2',
      timestamp: '2024-01-01'
    });
    const parsed = JSON.parse(output);
    expect(parsed.message).toBe('line1line2');
  });
});
