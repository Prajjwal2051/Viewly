export default {
  testEnvironment: 'node',
  coveragePathIgnorePatterns: ['/node_modules/'],
  testMatch: ['**/__tests__/**/*.test.js'],
  transform: {},
  extensionsToTreatAsEsm: ['.js'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/index.js',
    '!src/db/db_connection.js',
  ],
  testTimeout: 30000,
  verbose: true,
};
