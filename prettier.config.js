module.exports = {
  semi: true,
  trailingComma: 'all',
  singleQuote: true,
  printWidth: 80,
  tabWidth: 2,
  plugins: [
    require('@trivago/prettier-plugin-sort-imports')({
      groups: [
        // Node.js built-in modules first
        'builtin',

        // Third-party modules next
        'external',

        // Local modules last
        'internal',
        // Relative imports (starting with "./" or "../")
        'parent',
        'sibling',
      ],
      newlinesBetween: 'always',
    }),
  ],
};
