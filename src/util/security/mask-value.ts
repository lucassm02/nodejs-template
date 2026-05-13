import { SensitiveKeyType } from './is-sensitive-key';

export function maskCard(value: string): string {
  const digits = value.replace(/\D/g, '');
  if (digits.length < 10) return '*'.repeat(digits.length);
  const bin = digits.slice(0, 6);
  const last4 = digits.slice(-4);
  const middle = '*'.repeat(digits.length - 10);
  return bin + middle + last4;
}

export function maskRedact(): string {
  return '[REDACTED]';
}

export function maskPartial(value: string): string {
  const len = value.length;
  const maskCount = Math.floor(len * 0.8);
  return '*'.repeat(maskCount) + value.slice(maskCount);
}

export function applyMask(value: string, type: SensitiveKeyType): string {
  if (type === 'card') return maskCard(value);
  if (type === 'redact') return maskRedact();
  return maskPartial(value);
}

export function maskValue(value: string): string {
  return maskPartial(value);
}
