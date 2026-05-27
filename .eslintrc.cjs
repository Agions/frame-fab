/**
 * .eslintrc.cjs — ESLint 配置（含 DRY/重复检测规则）
 *
 * 改造后新增：
 * - sonarjs/no-duplicate：检测重复代码块
 * - max-params：避免函数参数过多（>4个参数说明需要重构）
 * - complexity：限制圈复杂度（>15说明需要拆分）
 *
 * CI 集成：在 .github/workflows/test.yml 中运行 eslint，阈值 0 重复
 */

module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
    'plugin:sonarjs/recommended',     // SonarJS 规则集（含 no-duplicate）
    'plugin:jsx-a11y/recommended',   // 无障碍
    'prettier',                        // 必须在最后，关闭与 prettier 冲突的规则
  ],
  plugins: ['sonarjs', 'no-copy-paste'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: { jsx: true },
  },
  settings: {
    react: { version: 'detect' },
    'import/resolver': { typescript: {} },
  },
  rules: {
    // =============================================
    // DRY / 重复代码检测
    // =============================================
    'sonarjs/no-duplicate': ['error', {
      ignoreLiterals: true,    // 忽略仅字面量不同的重复（如不同字符串常量）
      ignoreStrings: false,   // 不忽略字符串内容（它们可能本身就是重复）
    }],
    'max-lines': ['error', {
      max: 300,                // 单文件最多 300 行
      skipBlankLines: true,
      skipComments: true,
    }],
    'max-lines-per-function': ['error', { max: 80, skipBlankLines: true, skipComments: true }],
    'max-depth': ['error', 4],           // 嵌套深度不超过 4 层
    'max-nested-callbacks': ['error', 3],

    // =============================================
    // 函数质量
    // =============================================
    'complexity': ['error', { max: 15 }],
    'max-params': ['error', { max: 4 }],
    'consistent-return': 'error',
    'no-void': 'error',

    // =============================================
    // React 组件规范
    // =============================================
    'react/prop-types': 'off',           // TS 已做类型检查
    'react/jsx-no-target-blank': 'warn',
    'react-hooks/exhaustive-deps': 'warn', // 生产环境改为 error

    // =============================================
    // TypeScript
    // =============================================
    '@typescript-eslint/no-unused-vars': ['error', {
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_',
    }],
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',

    // =============================================
    // 无障碍（a11y）
    // =============================================
    'jsx-a11y/alt-text': 'error',
    'jsx-a11y/anchor-has-content': 'error',
    'jsx-a11y/aria-props': 'error',
    'jsx-a11y/no-autofocus': 'error',

    // =============================================
    // 禁止的代码模式
    // =============================================
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'no-eval': 'error',
    'no-implied-eval': 'error',
    'no-new-func': 'error',
    'no-param-reassign': 'error',
    'prefer-const': 'error',
  },
  overrides: [
    {
      files: ['*.test.ts', '*.test.tsx', '*.spec.ts', '*.spec.tsx'],
      rules: {
        'no-console': 'off',
        'max-lines-per-function': 'off',  // 测试文件放宽
        'max-depth': 'off',
      },
    },
    {
      files: ['*.js', '*.cjs'],
      rules: { '@typescript-eslint/no-require-imports': 'off' },
    },
  ],
};