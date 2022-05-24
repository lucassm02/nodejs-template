import { ValidationError } from 'yup';

import { convertCamelCaseKeysToSnakeCase } from '../object';

export interface PrettyYupError {
  message: string;
  param: string | undefined;
}

export function formatYupError(error: ValidationError): PrettyYupError[] {
  return error.inner.map((item) => ({
    message: item.message,
    param: convertCamelCaseKeysToSnakeCase(item.path),
  }));
}
