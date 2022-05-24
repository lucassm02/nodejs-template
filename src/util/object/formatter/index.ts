import {
  formateCamelCaseKeysForSnakeCase,
  formateSnakeCaseKeysForCamelCase,
  formateToLowerCase,
} from '@badass-team-code/formatted-cases-words';

export const convertSnakeCaseKeysToCamelCase = formateSnakeCaseKeysForCamelCase;
export const convertCamelCaseKeysToSnakeCase = formateCamelCaseKeysForSnakeCase;
export const convertToLowerCase = formateToLowerCase;
