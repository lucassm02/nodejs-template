import config from './jest.config';

const jestIntegrationConfig = {
  ...config,
  testMatch: ['**/test/integration/**/*.spec.ts'],
};

export default jestIntegrationConfig;
