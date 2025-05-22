import { pathsToModuleNameMapper } from 'ts-jest';

import { compilerOptions } from './tsconfig.json';

export default {
  transform: {
    '^.+\\.tsx?$': ['@swc/jest']
  },
  testEnvironment: 'node',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  clearMocks: true,
  setupFiles: ['<rootDir>/jest.env.js'],
  collectCoverageFrom: ['<rootDir>/src/**/*.ts', '!<rootDir>/src/main/**'],
  coveragePathIgnorePatterns: ['/node_modules/', '/src/data/protocols/*'],
  modulePathIgnorePatterns: ['<rootDir>/dist/'],
  coverageDirectory: 'coverage',
  coverageProvider: 'v8',
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, {
    prefix: '<rootDir>/src/'
  }),
  automock: false
};
