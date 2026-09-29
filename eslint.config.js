// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*', '.expo/*', 'node_modules/*'],
  },
  {
    // Build scripts run in Node.
    files: ['scripts/**/*.mjs'],
    languageOptions: { globals: { Buffer: 'readonly', console: 'readonly', process: 'readonly' } },
  },
]);
