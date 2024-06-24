import js from '@eslint/js';
//import globals from 'globals';

export default [
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.es2021,
      },
    },
    plugins: {
      '@typescript-eslint': require('@typescript-eslint/eslint-plugin'),
    },
    rules: {
      ...js.configs.recommended.rules,
      'no-unused-vars': 'error',
      '@typescript-eslint/no-unused-vars': 'error',
    },
  },
];
