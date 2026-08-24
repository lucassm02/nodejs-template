/* eslint-disable @typescript-eslint/no-explicit-any */
import { getSensitiveKeyType, SensitiveKeyType } from './is-sensitive-key';
import { applyMask } from './mask-value';

type AnyObject = Record<string, any>;

const SENSITIVE_SUB_VALUES = ['number', 'value', 'content'];

const isMaskable = (value: unknown): boolean =>
  typeof value === 'string' || typeof value === 'number';

// Returns the received value itself whenever nothing was masked, so a payload
// with no sensitive field costs no allocation and the caller does not hold a
// full duplicate of the object graph while the log is written. The result is
// therefore allowed to share structure with the input and must not be mutated.
export function sanitizeObject(
  obj: any,
  parentType: SensitiveKeyType | null = null
): any {
  if (Array.isArray(obj)) {
    let sanitized: any[] | null = null;

    for (let index = 0; index < obj.length; index++) {
      const item = obj[index];
      const next = sanitizeObject(item, parentType);

      if (next !== item) {
        if (sanitized === null) sanitized = obj.slice();
        sanitized[index] = next;
      }
    }

    return sanitized ?? obj;
  }

  if (obj !== null && typeof obj === 'object') {
    const keys = Object.keys(obj);
    let sanitized: AnyObject | null = null;

    for (let index = 0; index < keys.length; index++) {
      const key = keys[index];
      const value = (obj as AnyObject)[key];
      const keyType = getSensitiveKeyType(key, value);

      let next: unknown;

      if (keyType && isMaskable(value)) {
        next = applyMask(String(value), keyType);
      } else if (
        parentType &&
        SENSITIVE_SUB_VALUES.includes(key) &&
        isMaskable(value)
      ) {
        next = applyMask(String(value), parentType);
      } else {
        next = sanitizeObject(value, keyType ?? parentType);
      }

      if (next !== value) {
        if (sanitized === null) sanitized = { ...(obj as AnyObject) };
        sanitized[key] = next;
      }
    }

    return sanitized ?? obj;
  }

  return obj;
}
