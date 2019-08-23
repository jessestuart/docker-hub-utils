module.exports = {
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:import/typescript',
    'prettier/@typescript-eslint',
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'import', 'prettier'],
  parserOptions: {
    sourceType: 'module',
  },
  env: {
    jest: true,
    node: true,
  },
  rules: {
    'comma-dangle': ['error', 'always-multiline'],
    'no-console': ['warn'],
    'object-curly-spacing': ['error', 'always'],
    'prettier/prettier': [
      'error',
      {
        parser: 'typescript',
        printWidth: 80,
        semi: false,
        singleQuote: true,
        tabWidth: 2,
        trailingComma: 'all',
      },
    ],
    '@typescript-eslint/camelcase': ['off'],
    '@typescript-eslint/explicit-function-return-type': ['off'],
    '@typescript-eslint/indent': ['off'],
    '@typescript-eslint/member-delimiter-style': [
      'error',
      { multiline: { delimiter: 'none' } },
    ],
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/no-explicit-any': ['off'],
    '@typescript-eslint/ban-ts-ignore': ['warn'],
  },
}
