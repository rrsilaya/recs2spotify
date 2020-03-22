const path = require('path');

const CopyWebpackPlugin = require('copy-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const ZipPlugin = require('zip-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin')


const config = {
    entry: {
        background: ['@babel/polyfill', './src/background.js'],
        core: ['@babel/polyfill', './src/core.js'],
        popup: ['@babel/polyfill', './src/popup.js'],
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
                        presets: ['@babel/preset-env']
                    }
                }
            },
            {
                test: /\.scss$/,
                loader: [
                    MiniCssExtractPlugin.loader,
                    'css-loader',
                    {
                        loader: 'sass-loader',
                        options: { sourceMap: false },
                    },
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
        new ZipPlugin({
            filename: 'recs2spotify.zip',
            path: '../dist',
        })
    ],
    optimization: {
        minimizer: [new UglifyJsPlugin()]
    }
};

module.exports = config;

