import { pathsToModuleNameMapper } from 'ts-jest';

import { compilerOptions } from './tsconfig.json';

export default {
  clearMocks: true,
  collectCoverageFrom: ['<rootDir>/src/**/*.ts', '!<rootDir>/src/main/**'],
  modulePathIgnorePatterns: ['<rootDir>/dist/'],
  coverageDirectory: 'coverage',
  coverageProvider: 'babel',
  testEnvironment: 'node',
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, {
    prefix: '<rootDir>/src/',
  }),
  preset: 'ts-jest',
};
