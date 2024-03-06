import config from './jest.config';

const jestE2EConfig = {
  ...config,
  testMatch: ['**/test/e2e/**/*.spec.ts']
};

export default jestE2EConfig;
