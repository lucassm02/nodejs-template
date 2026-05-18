/* eslint-disable @typescript-eslint/no-explicit-any */
import { getSensitiveKeyType, SensitiveKeyType } from './is-sensitive-key';
import { applyMask } from './mask-value';

type AnyObject = Record<string, any>;

const SENSITIVE_SUB_VALUES = ['number', 'value', 'content'];

export function sanitizeObject(
  obj: any,
  parentType: SensitiveKeyType | null = null
): any {
  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeObject(item, parentType));
  }

  if (obj !== null && typeof obj === 'object') {
    const out: AnyObject = {};
    for (const [key, val] of Object.entries(obj)) {
      const keyType = getSensitiveKeyType(key, val);

      if (keyType && ['string', 'number'].includes(typeof val)) {
        out[key] = applyMask(String(val), keyType);
      } else if (
        parentType &&
        SENSITIVE_SUB_VALUES.includes(key) &&
        ['string', 'number'].includes(typeof val)
      ) {
        out[key] = applyMask(String(val), parentType);
      } else {
        out[key] = sanitizeObject(val, keyType ?? parentType);
      }
    }
    return out;
  }

  return obj;
}
