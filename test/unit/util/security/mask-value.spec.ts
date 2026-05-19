import {
  maskCard,
  maskRedact,
  maskPartial,
  applyMask,
  maskValue
} from '@/util/security/mask-value';

describe('maskCard', () => {
  it('should mask middle digits keeping first 6 and last 4', () => {
    const result = maskCard('4111111111111111');
    expect(result).toBe('411111******1111');
  });

  it('should strip non-digits before masking', () => {
    const result = maskCard('4111-1111-1111-1111');
    expect(result).toBe('411111******1111');
  });

  it('should return asterisks for card with less than 10 digits', () => {
    const result = maskCard('12345');
    expect(result).toBe('*****');
  });

  it('should handle exactly 10 digits (no middle)', () => {
    const result = maskCard('1234561234');
    expect(result).toBe('1234561234');
  });
});

describe('maskRedact', () => {
  it('should return [REDACTED]', () => {
    expect(maskRedact()).toBe('[REDACTED]');
  });
});

describe('maskPartial', () => {
  it('should mask 80% of the string from the start', () => {
    const result = maskPartial('1234567890');
    expect(result).toBe('********90');
  });

  it('should handle short strings', () => {
    const result = maskPartial('ab');
    expect(result).toBe('*b');
  });

  it('should handle single character', () => {
    const result = maskPartial('x');
    expect(result).toBe('x');
  });
});

describe('applyMask', () => {
  it('should apply card mask when type is card', () => {
    const result = applyMask('4111111111111111', 'card');
    expect(result).toBe('411111******1111');
  });

  it('should apply redact when type is redact', () => {
    const result = applyMask('any_value', 'redact');
    expect(result).toBe('[REDACTED]');
  });

  it('should apply partial mask for other types', () => {
    const result = applyMask('password123', 'partial');
    expect(result).toMatch(/^\*+/);
  });
});

describe('maskValue', () => {
  it('should apply partial mask', () => {
    const result = maskValue('secret');
    expect(result).toBe('****et');
  });
});
