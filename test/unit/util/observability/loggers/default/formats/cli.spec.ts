import { cli } from '@/util/observability/loggers/default/formats/cli';

const applyFormat = (info: Record<string, unknown>): string => {
  return (cli as any).transform(info)[Symbol.for('message')];
};

describe('cli format', () => {
  it('should output base text only when no extra params', () => {
    const output = applyFormat({
      level: 'info',
      timestamp: '2024-01-01 00:00:00'
    });
    expect(output).toBe('LEVEL: [INFO], TIMESTAMP: [2024-01-01 00:00:00]');
  });

  it('should include extra param in output', () => {
    const output = applyFormat({
      level: 'error',
      timestamp: '2024-01-01',
      message: 'hello'
    });
    expect(output).toContain('LEVEL: [ERROR], TIMESTAMP: [2024-01-01]');
    expect(output).toContain('MESSAGE: [hello]');
  });

  it('should skip falsy params', () => {
    const output = applyFormat({
      level: 'info',
      timestamp: '2024-01-01',
      empty: '',
      nullVal: null
    });
    expect(output).not.toContain('EMPTY');
    expect(output).not.toContain('NULLVAL');
  });

  it('should sanitize newlines in param values', () => {
    const output = applyFormat({
      level: 'info',
      timestamp: '2024-01-01',
      message: 'line1\nline2'
    });
    expect(output).toContain('MESSAGE: [line1line2]');
  });

  it('should JSON-stringify object params', () => {
    const output = applyFormat({
      level: 'info',
      timestamp: '2024-01-01',
      meta: { key: 'val' }
    });
    expect(output).toContain('META: [{"key":"val"}]');
  });
});
