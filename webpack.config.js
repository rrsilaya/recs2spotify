const path = require('path');

const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const config = {
    entry: {
        background: './src/background.js',
        core: './src/core.js',
        popup: './src/popup.js',
        style: './src/styles/index.scss',
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'build')
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env'],
                        plugins: [
                            '@babel/plugin-transform-runtime',
                            'transform-class-properties'
                        ]
                    }
                }
            },
            {
                test: /\.scss$/,
                loader: [
                    MiniCssExtractPlugin.loader,
                    'css-loader',
                    'sass-loader',
                ],
            },
            {
                test: /\.(eot|svg|ttf|woff)$/,
                loader: 'file-loader',
                options: {
                    name: '[name].[ext]',
                    outputPath: 'fonts/',
                },
            },
        ],
    },
    mode: 'development',
    devtool: 'cheap-module-source-map',
    plugins: [
        new CopyWebpackPlugin([
            { from: './src/config' },
            { from: './src/static' },
        ]),
        new MiniCssExtractPlugin({ filename: '[name].css' }),
    ],
};

module.exports = config;
