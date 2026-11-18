import js from '@eslint/js'
import eslintConfigPrettier from 'eslint-config-prettier'
import { flatConfigs as importX } from 'eslint-plugin-import-x'
import reactHooks from 'eslint-plugin-react-hooks'
import { reactRefresh } from 'eslint-plugin-react-refresh'
import simpleImportSort from 'eslint-plugin-simple-import-sort'
import globals from 'globals'
import { config, configs } from 'typescript-eslint'

export default config(
  { ignores: ['dist', 'pnpm-lock.yaml'] },
  {
    extends: [
      js.configs.recommended,
      eslintConfigPrettier,
      importX.recommended,
      importX.typescript,
      ...configs.recommended,
    ],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh.plugin,
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
      '@typescript-eslint/naming-convention': [
        'error',
        {
          selector: 'typeParameter',
          format: ['PascalCase'],
          custom: { regex: '^[A-Z][a-z]', match: true },
        },
      ],
      'max-params': ['error', 3],
      'no-restricted-syntax': [
        'error',
        {
          selector: 'FunctionDeclaration[id.name!="assert"][params.length>1]',
          message:
            'Use one object param with named fields for two or more params.',
        },
        {
          selector:
            'VariableDeclarator[id.name!=/^(by|compare)[A-Z]/] > ArrowFunctionExpression[params.length>1]',
          message:
            'Use one object param with named fields for two or more params.',
        },
        {
          selector:
            'VariableDeclarator[id.name!=/^(by|compare)[A-Z]/] > FunctionExpression[params.length>1]',
          message:
            'Use one object param with named fields for two or more params.',
        },
      ],
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
