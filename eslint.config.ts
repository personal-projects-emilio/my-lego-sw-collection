import js from '@eslint/js'
import eslintConfigPrettier from 'eslint-config-prettier'
import { flatConfigs as importX } from 'eslint-plugin-import-x'
import reactHooks from 'eslint-plugin-react-hooks'
import { reactRefresh } from 'eslint-plugin-react-refresh'
import simpleImportSort from 'eslint-plugin-simple-import-sort'
import globals from 'globals'
import { config, configs } from 'typescript-eslint'

const verbFirstName =
  '/^([A-Z]|(use|on|by|compare|get|set|build|create|find|count|group|sort|filter|format|parse|map|merge|move|open|close|toggle|reset|save|load|fetch|delete|remove|add|apply|render|read|write|hide|show|clamp|run|is|has|can|to|handle|update|edit|mutate|refresh|login|logout|clear|select|validate|compute|split|undo|insert|replace|store|resize|assert|check|keep|pick|focus|restore|flush|cancel|start|stop|schedule|extract|import|export|normalize|sanitize|nest|flatten|collect|ensure|suppress|commit|prefill|skip|sum|rename|reparent|walk|pluralize|fill|does)([A-Z]|$))/'
const verbFirstMessage =
  'Start function names with a verb (getItems, isOpen, toLabel), not a noun.'

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
      '@typescript-eslint/consistent-type-assertions': [
        'error',
        { assertionStyle: 'never' },
      ],
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
          custom: { regex: '^(TData$|[A-Z][a-z])', match: true },
        },
      ],
      'max-params': ['error', 3],
      'no-restricted-syntax': [
        'error',
        {
          selector: `FunctionDeclaration[id.name!=${verbFirstName}]`,
          message: verbFirstMessage,
        },
        {
          selector: `VariableDeclarator[id.name!=${verbFirstName}] > :matches(ArrowFunctionExpression, FunctionExpression)`,
          message: verbFirstMessage,
        },
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
