import config from './jest.config';

const jestUnitConfig = { ...config, testMatch: ['**/test/unit/**/*.spec.ts'] };

export default jestUnitConfig;
