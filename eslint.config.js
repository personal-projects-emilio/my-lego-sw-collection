import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import eslintConfigPrettier from 'eslint-config-prettier'
import simpleImportSort from 'eslint-plugin-simple-import-sort'
import { flatConfigs as importX } from 'eslint-plugin-import-x'

export default tseslint.config(
  { ignores: ['dist', 'pnpm-lock.yaml'] },
  {
    extends: [
      js.configs.recommended,
      eslintConfigPrettier,
      importX.recommended,
      importX.typescript,
      ...tseslint.configs.recommended,
    ],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      'simple-import-sort': simpleImportSort,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          fixStyle: 'inline-type-imports',
        },
      ],
      '@typescript-eslint/no-import-type-side-effects': 'error',
      'import-x/no-duplicates': ['error', { 'prefer-inline': true }],
      'import-x/newline-after-import': 'error',
      'max-params': ['error', 3],
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      'simple-import-sort/exports': 'error',
      'simple-import-sort/imports': [
        'error',
        {
          groups: [
            // Side effect first
            ['^\\u0000'],
            // React
            ['^react'],
            ['^@?\\w'],
          ],
        },
      ],
    },
    settings: {
      'import-x/resolver': {
        typescript: {
          project: ['tsconfig.app.json', 'tsconfig.node.json'],
          noWarnOnMultipleProjects: true,
        },
      },
    },
  }
)
