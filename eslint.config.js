import js from '@eslint/js';
//import globals from './node_modules/globals/globals.json' assert { type: 'json' };

export default [
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    rules: {
      ...js.configs.recommended.rules,
      'no-unused-vars': 'error',
    },
  },
];
