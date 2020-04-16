module.exports = (api) => {
    return {
        'env': {
            'test': {
                'plugins': [
                    require.resolve('babel-plugin-dynamic-import-node'),
                ],
            },
        },
        'presets': [
            require.resolve('@babel/preset-typescript'),
            require.resolve('@babel/preset-react'),
            require.resolve(
                '@babel/preset-env',
                api.env('development')
                    ? {
                        'useBuiltIns': "usage",
                        'corejs': 3,
                        'debug': true,
                    }
                    : undefined,
            ),
        ],

        'plugins': [
            // Reuse babel's injected headers
            [require.resolve('@babel/plugin-transform-runtime'), {
                'corejs': 3,
                'regenerator': true,
            }],

            // Stage 2
            [require.resolve('@babel/plugin-proposal-decorators'), { 'legacy': true }],
            require.resolve('@babel/plugin-proposal-function-sent'),
            require.resolve('@babel/plugin-proposal-export-namespace-from'),
            require.resolve('@babel/plugin-proposal-numeric-separator'),
            require.resolve('@babel/plugin-proposal-throw-expressions'),

            // Stage 3
            require.resolve('@babel/plugin-syntax-dynamic-import'),
            require.resolve('@babel/plugin-syntax-import-meta'),
            [require.resolve('@babel/plugin-proposal-class-properties'), { 'loose': false }],
            require.resolve('@babel/plugin-proposal-json-strings'),

            [
                require.resolve('babel-plugin-module-resolver'),
                {
                    'root': ['.'],
                    'extensions': ['.js', '.jsx', '.ts', '.tsx'],
                    'alias': {
                        '#components': './src/components',
                        '#config': './src/config',
                        '#request': './src/request',
                        '#resources': './src/resources',
                        '#schema': './src/schema',
                        '#ts': './src/ts',
                        '#utils': './src/utils',
                        '#views': './src/views',
                    },
                },
            ],
        ],
    };
};
