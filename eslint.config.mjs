// @ts-check
import globals from 'globals';
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import { globalIgnores } from 'eslint/config';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';

export default tseslint.config(
  globalIgnores([
    'eslint.config.mjs',

    '**/node_modules/',
    '**/.git/',
    '**/dist/',
    '**/build/',
    '**/coverage/',
    '**/.turbo/',
    '**/.nx/',
    '**/.cache/',

    '**/generated/',
    '**/.prisma/',
    '**/prisma/generated/',
    '**/*.generated.ts',
    '**/*.proto.ts',
    '**/*.d.ts',
  ]),

  {
    files: ['{apps,libs}/**/*.ts', '{apps,libs}/**/*.tsx'],
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.recommendedTypeChecked,
      eslintPluginPrettierRecommended,
    ],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      sourceType: 'commonjs',
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',
    },
  },

  {
    files: ['*.js', '*.cjs'],
    extends: [eslint.configs.recommended],
    languageOptions: {
      globals: {
        ...globals.node,
      },
      sourceType: 'commonjs',
    },
  },

  {
    files: ['*.mjs'],
    extends: [eslint.configs.recommended],
    languageOptions: {
      globals: {
        ...globals.node,
      },
      sourceType: 'module',
    },
  },
);