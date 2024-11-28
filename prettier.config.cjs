/** @type {import('prettier').Config} */
module.exports = {
  arrowParens: 'always',
  printWidth: 100,
  semi: true,
  singleQuote: true,
  tabWidth: 2,
  trailingComma: 'all',

  importOrder: [
    '^server-only|client-only$',
    '^react$',
    '^next(/.*)?$',
    '<THIRD_PARTY_MODULES>',
    '^@documenso/(.*)$',
    '^~/(.*)$',
    '^[./]',
  ],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
  importOrderParserPlugins: ['typescript', 'jsx', 'decorators-legacy'],

  plugins: [
    '@trivago/prettier-plugin-sort-imports',
    'prettier-plugin-sql',
    'prettier-plugin-svelte',
    'prettier-plugin-tailwindcss',
  ],

  overrides: [
    {
      files: ['*.sql'],
      options: {
        language: 'postgresql',
        keywordCase: 'upper',
        expressionWidth: 60,
      },
    },
    {
      files: ['*.svelte'],
      options: {
        parser: 'svelte',
      }
    }
  ],
};
