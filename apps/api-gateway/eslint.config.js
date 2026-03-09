const baseConfig = require('../../eslint.base.config.mjs');

module.exports = [
  ...baseConfig.default,
  {
    files: ['apps/api-gateway/**/*.ts', 'apps/api-gateway/**/*.js'],
    rules: {},
  },
  {
    files: ['apps/api-gateway/src/main.ts'],
    rules: {},
  },
];
