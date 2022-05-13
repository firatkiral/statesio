const path = require('path');
const CopyPlugin = require("copy-webpack-plugin");

let options = {
    entry: './build/statemesh.js',
    // target: ['web', 'es6'],
    mode: "production",
    optimization: {
        minimize: true
    },
    module: {
        rules: [
            {
                test: /\.css$/i,
                use: ['style-loader', 'css-loader'],
            },
        ],
    },
};

module.exports = [
    {
        ...options,
        output: {
            filename: 'statemesh.min.js',
            path: path.resolve(__dirname, 'dist'),
            library: {
                name: 'statemesh',
                type: 'window',
                // type: 'var', // if three is global namespace
                // export: ['default'],
            },
        },
    },
    {
        ...options,
        output: {
            filename: 'statemesh.module.js',
            path: path.resolve(__dirname, 'dist'),
            library: {
                type: 'module'
            },
        },
        experiments: {
            outputModule: true,
        },
    },
    {
        ...options,
        output: {
            filename: 'statemesh.js',
            path: path.resolve(__dirname, 'dist'),
            library: {
                type: 'commonjs'
            },
        },
        plugins: [
            new CopyPlugin({
                patterns: [
                    { from: './build/statemesh.d.ts', to: 'statemesh.d.ts' },
                    { from: './build/statemesh.d.ts', to: 'statemesh.module.d.ts' },
                ],
            }),
        ],
    }];

