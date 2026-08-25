import {
  camelCaseKeyFormatter,
  lowerCaseKeyFormatter,
  snakeCaseKeyFormatter
} from './key-case-formatter';
import { recursiveDataConvertFilterLayer } from './recursive-data-converter';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const convertSnakeCaseKeysToCamelCase = (data: any): any =>
  recursiveDataConvertFilterLayer(data, snakeCaseKeyFormatter);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const convertCamelCaseKeysToSnakeCase = (data: any): any =>
  recursiveDataConvertFilterLayer(data, camelCaseKeyFormatter);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const convertToLowerCase = (data: any): any =>
  recursiveDataConvertFilterLayer(data, lowerCaseKeyFormatter);
