const path = require('path')
const ESLintPlugin = require('eslint-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
module.exports = {
    // 相对路径
    entry: './src/main.js',
    // 绝对路径
    output: {
        path: path.resolve(__dirname, '../dist'),
        // 入口文件输出的文件名
        filename: 'js/main.js',
        clean: true
    },
    module: {
        rules: [
            {
                test: /\.css$/i,
                use: [MiniCssExtractPlugin.loader, 'css-loader'],
            },
            {
                test: /\.s[ac]ss$/i,
                use: [MiniCssExtractPlugin.loader, 'css-loader', "sass-loader"],
            },
            {
                test: /\.(png|jpe?g|webp|gif)$/i,
                type: 'asset',
                parser: {
                    dataUrlCondition: {
                        maxSize: 10 * 1024 // 4kb
                    }
                },
                generator: {
                    filename: 'images/[name].[hash:6][ext]'
                }
            },
            {
                test: /\.svg$/i,
                // 把所有文件转成base64格式
                type: 'asset/inline',
            },
            {
                test: /\.js$/,
                // 排除检查项
                exclude: /(node_modules)/,
                use: {
                    loader: 'babel-loader',
                },
            },
        ]
    },
    plugins: [
        new ESLintPlugin({
            context: './src'
        }),
        new HtmlWebpackPlugin(
            {
                template: path.resolve(__dirname, '../public/index.html'),
                filename: 'index.html',
                inject: 'body',        // JS 注入到 body 底部
                title: 'webpack',
                hash: true,
                minify: {                     // 压缩配置（生产环境）
                    collapseWhitespace: true,   // 移除空格
                    removeComments: true,       // 移除注释
                    removeRedundantAttributes: true
                },
                hash: true,
            }
        ),
        new MiniCssExtractPlugin({
            // 输出的 CSS 文件名（支持 [name]、[contenthash] 等占位符）
            filename: 'css/[name].[contenthash].css',
            // 非入口的 chunk 对应的 CSS 文件名（如代码分割产生的 CSS）
            chunkFilename: 'css/[name].[contenthash].chunk.css'
        })
    ],
    mode: 'development'
}