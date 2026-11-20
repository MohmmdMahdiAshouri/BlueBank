import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';

/** @type {import('eslint').Linter.Config[]} */
export const baseConfig = [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  prettier,
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.turbo/**',
      '**/build/**',
      '**/.next/**',
      '**/next-env.d.ts',
      '**/commitlint.config.cjs',
      '**/commitlint.config.js',
      '**/out/**',
    ],
  },
];
