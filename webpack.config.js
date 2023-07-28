const path = require('path');
const CopyPlugin = require("copy-webpack-plugin");

let options = {
    entry: './build/statesio.js',
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
            filename: 'statesio.min.js',
            path: path.resolve(__dirname, 'dist'),
            library: {
                name: 'statesio',
                type: 'window',
                // type: 'var', // if three is global namespace
                // export: ['default'],
            },
        },
    },
    {
        ...options,
        output: {
            filename: 'statesio.module.js',
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
            filename: 'statesio.js',
            path: path.resolve(__dirname, 'dist'),
            library: {
                type: 'commonjs'
            },
        },
        plugins: [
            new CopyPlugin({
                patterns: [
                    { from: './build/statesio.d.ts', to: 'statesio.d.ts' },
                    { from: './build/statesio.d.ts', to: 'statesio.module.d.ts' },
                ],
            }),
        ],
    }];

