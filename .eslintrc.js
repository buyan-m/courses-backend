module.exports = {
    root: true,
    env: {
        node: true,
        jest: true
    },
    rules: {
        indent: [ 'error', 4 ],
        semi: [ 'error', 'never' ],
        'max-len': [ 'error', 120 ],
        'linebreak-style': [ 'error', 'unix' ],
        'object-curly-spacing': [ 'error', 'always' ],
        'object-curly-newline': [
            'error',
            {
                ObjectExpression: { multiline: true, minProperties: 3 },
                ObjectPattern: { multiline: true, minProperties: 3 },
                ImportDeclaration: { multiline: true, minProperties: 3 },
                ExportDeclaration: { multiline: true, minProperties: 3 }
            }
        ],
        'object-property-newline': [ 'error', { allowAllPropertiesOnSameLine: true } ],
        'array-bracket-newline': [ 'error', { multiline: true } ],
        'array-bracket-spacing': [ 'error', 'always' ],
        'array-element-newline': [ 'error', 'consistent' ],
        'eol-last': [ 'error', 'always' ],
        'function-paren-newline': [ 'error', 'multiline-arguments' ],
        'function-call-argument-newline': [ 'error', 'consistent' ],
        'no-multiple-empty-lines': [
            'error',
            {
                max: 1, maxEOF: 0, maxBOF: 0
            }
        ],
        'lines-between-class-members': [ 'error', 'always' ],
        'no-whitespace-before-property': 'error',
        'no-trailing-spaces': 'error',
        'arrow-spacing': [ 'error', { before: true, after: true } ],
        'comma-spacing': [ 'error', { before: false, after: true } ],
        'computed-property-spacing': [ 'error', 'never' ],
        'func-call-spacing': [ 'error', 'never' ],
        'key-spacing': 'error',
        'keyword-spacing': 'error',
        'no-mixed-spaces-and-tabs': 'error',
        'no-unused-vars': 'error',
        'no-unused-private-class-members': 'error',
        'no-unreachable': 'error',
        'no-undef': 'error',
        'quote-props': [ 'error', 'as-needed' ],
        quotes: [ 'error', 'single' ],
        'import/no-named-as-default': 0,
        'import/no-named-as-default-member': 0,
        'space-infix-ops': 'error'
    },
    overrides: [
        {
            files: [ '*.ts' ],
            plugins: [ '@typescript-eslint/eslint-plugin' ],
            parser: '@typescript-eslint/parser',
            parserOptions: {
                project: 'tsconfig.json',
                tsconfigRootDir: __dirname
            },
            extends: [ 'plugin:@typescript-eslint/recommended' ],
            rules: {
                '@typescript-eslint/interface-name-prefix': 'off',
                '@typescript-eslint/explicit-function-return-type': 'off',
                '@typescript-eslint/explicit-module-boundary-types': 'off',
                '@typescript-eslint/no-explicit-any': 'off',
                '@typescript-eslint/indent': [ 'error', 4 ],
                '@typescript-eslint/semi': [ 'error', 'never' ],
                '@typescript-eslint/comma-dangle': [ 'error', 'never' ],
            }
        },
        {
            files: [ 'types.d.ts' ],
            rules: {
                'max-classes-per-file': 'off',
                'max-len': 'off'
            }
        }
    ]
}
