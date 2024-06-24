import js from '@eslint/js';
import globals from 'globals';
//import globals from './node_modules/globals/globals.json' assert { type: 'json' };

export default [
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.es2021,
        ...globals.node,
        ...globals.jest,
      },
    },
    rules: {
      ...js.configs.recommended.rules,
      'no-unused-vars': 'error',
    },
  },
];
