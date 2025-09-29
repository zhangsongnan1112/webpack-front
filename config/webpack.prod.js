const path = require('path')
const os = require('os')
const ESLintPlugin = require('eslint-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const ImageMinimizerPlugin = require('image-minimizer-webpack-plugin');
const PreloadWebpackPlugin = require('@vue/preload-webpack-plugin');


const cpuLen = os.cpus().length  //  获取cpu核数

const getLoader = (loader) => {
    return [
        MiniCssExtractPlugin.loader,
        'css-loader',
        {
            loader: 'postcss-loader', // 处理css 样式的兼容性
            options: {
                postcssOptions: {
                    plugins: [
                        [
                            'postcss-preset-env',
                            {
                                // 其他选项
                            },
                        ],
                    ],
                },
            }
        },
        loader
    ].filter(Boolean)
}

module.exports = {
    // 相对路径
    entry: './src/main.js',
    // 绝对路径
    output: {
        path: path.resolve(__dirname, '../dist'),
        // 入口文件输出的文件名
        filename: 'js/[name].[contenthash:6].js',
        // 输出的chunk文件的名字
        chunkFilename: 'js/[name].[contenthash:6].chunk.js',
        clean: true
    },
    module: {
        rules: [
            {
                oneOf: [
                    {
                        test: /\.css$/i,
                        use: getLoader()
                    },
                    {
                        test: /\.s[ac]ss$/i,
                        use: getLoader('sass-loader')
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
                            filename: 'images/[name].[hash:6][ext][query]'
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
                        use: [
                            {
                                loader: 'thread-loader',
                                options: {
                                    workers: cpuLen - 1
                                }
                            },
                            {
                                loader: 'babel-loader',
                                options: {
                                    cacheDirectory: true,  // 缓存
                                }
                            },
                        ],
                        include: path.resolve(__dirname, '../src'),
                    },
                ]
            }
        ]
    },
    plugins: [
        new ESLintPlugin({
            context: './src',
            cache: true,
            threads: cpuLen // 开启多进程
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
            filename: 'css/[name].[contenthash:6].css',
            // 非入口的 chunk 对应的 CSS 文件名（如代码分割产生的 CSS）
            chunkFilename: 'css/[name].[contenthash:6].chunk.css'
        }),
        new PreloadWebpackPlugin({
            rel: 'preload',
            as: 'script',
        })
    ],
    // 优化相关的plugin
    optimization: {
        splitChunks: {
            chunks: 'all',
            minSize: 0
        },
        runtimeChunk: {
            name: 'runtime', 
        },
        minimizer: [
            new CssMinimizerPlugin(),
            new TerserPlugin(
                {
                    parallel: cpuLen - 1 // 开启多线程
                }
            ),
            new ImageMinimizerPlugin({
                minimizer: {
                    implementation: ImageMinimizerPlugin.imageminMinify,
                    options: {
                        plugins: [
                            ['gifsicle', { interlaced: true }],
                            ['jpegtran', { progressive: true }],
                            ['optipng', { optimizationLevel: 5 }],
                            [
                                'svgo',
                                {
                                    plugins: [
                                        {
                                            name: 'preset-default',
                                            params: {
                                                overrides: {
                                                    removeViewBox: false,
                                                },
                                            },
                                        },
                                        {
                                            name: 'addAttributesToSVGElement',
                                            params: {
                                                attributes: [{ xmlns: 'http://www.w3.org/2000/svg' }],
                                            },
                                        },
                                    ],
                                },
                            ],
                        ],
                    },
                },
            }),
        ]
    },
    mode: 'production',
    devtool: 'source-map', // 生成完整 sour
    cache: {
        type: 'filesystem',
        cacheDirectory: path.resolve(__dirname, '.dev-cache'),
        buildDependencies: { config: [__filename] } // 配置变化时缓存失效
    }
}