const path = require('path');

const CopyWebpackPlugin = require('copy-webpack-plugin');

const config = {
    entry: {
        background: './src/background.js',
        core: './src/core.js',
        popup: './src/popup.js',
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'build')
    },
    mode: 'development',
    devtool: 'cheap-module-source-map',
    plugins: [
        new CopyWebpackPlugin([
            { from: './src/config' },
            { from: './src/static' },
        ])
    ],
};

module.exports = config;
