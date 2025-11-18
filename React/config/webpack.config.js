const ESLintPlugin = require('eslint-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const path = require('path')
// css 提取的 
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
// css压缩的 
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
// js 压缩的
const TerserPlugin = require('terser-webpack-plugin');
// 压缩图片 
const ImageMinimizerPlugin = require('image-minimizer-webpack-plugin');
// 复制pubilc 文件夹
const CopyPlugin = require('copy-webpack-plugin');
//  做react热更新的 
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');


const isProduction = process.env.NODE_ENV === 'production'

module.exports = {
    entry: './src/main.js',
    output: {
        path: isProduction ?  path.resolve(__dirname, '../dist') : undefined,
        filename: isProduction ? 'static/js/[name][contenthash:6].js' : 'static/js/[name].js',
        chunkFilename: isProduction ? 'static/js/[name][contenthash:6].chunk.js' : 'static/js/[name].chunk.js',  // 如异步加载的模块、公共依赖拆分的 chunk
        assetModuleFilename: 'static/media/[name][contenthash:6][ext][query]',  // 资源模块（如图片、字体等，通过 type: 'asset' 处理的文件）的命名规则
        clean: true
    },
    module: {
        rules: [
            // 处理css 
            {
                test: /\.css$/i,
                use: [isProduction ? MiniCssExtractPlugin.loader: 'style-loader', "css-loader", {
                    loader: 'postcss-loader',  // 处理css兼容性的 要配合package.json 里面的browserslist 制定兼容性兼容到什么程度
                    options: {
                        postcssOptions: {
                            plugins: ["postcss-preset-env"],
                        }
                    }
                }]
            },
            {
                test: /\.s[ac]ss$/i,
                use: [isProduction ? MiniCssExtractPlugin.loader : 'style-loader', "css-loader", {
                    loader: 'postcss-loader',  // 处理css兼容性的 要配合package.json 里面的browserslist 制定兼容性兼容到什么程度
                    options: {
                        postcssOptions: {
                            plugins: ["postcss-preset-env"],
                        }
                    }
                }, "sass-loader"]
            },
            // 处理图片
            {
                test: /\.(png|jpe?g|gif|webp)$/i,
                type: 'asset',
                parser: {
                    dataUrlCondition: {
                        maxSize: 10 * 1024 // 10KB阈值
                    }
                },
            },
            // 处理js
            {
                test: /\.jsx?$/,
                loader: 'babel-loader',
                exclude: /node_modules/,
                include: path.resolve(__dirname, '../src'),
                options: {
                    plugins: [ !isProduction && 'react-refresh/babel'].filter(Boolean) // ✅ 正确位置
                }
            }

        ]
    },
    plugins: [
        new ESLintPlugin({
            context: path.resolve(__dirname, '../src'),
            exclude: "node_modules",
        }),
        // 处理html
        new HtmlWebpackPlugin(
            {
                template: path.resolve(__dirname, '../public/index.html'),
                filename: 'index.html',
            }
        ),
        isProduction && new MiniCssExtractPlugin(
            {
                filename: 'static/css/[name][chunkhash:6].css',
                chunkFilename: 'static/css/[name][chunkhash:6].chunk.css',
            }
        ),
        !isProduction &&new ReactRefreshWebpackPlugin(),  //  // 启动react 🔥更新
        isProduction && new CopyPlugin({
            patterns: [
                {
                    from: path.resolve(__dirname, '../public'),
                    to: path.resolve(__dirname, '../dist'),
                    globOptions: {
                        ignore: ['**/index.html'], // 忽略 public 目录下的 index.html（避免覆盖 HtmlWebpackPlugin 生成的 HTML）
                    },
                }
            ],
        })
    ].filter(Boolean),
    resolve: {
        extensions: ['.jsx', '.js', '.json'] // 按优先级解析后缀
    },
    mode: isProduction ? 'production' : 'development',
    devtool: isProduction ? 'source-map' : 'cheap-module-source-map',
    optimization: {
        minimize: isProduction,
        minimizer: [
            new CssMinimizerPlugin(),
            new TerserPlugin(),
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
        ],
        splitChunks: {
            chunks: 'all',
        }
    },
    devServer: {
        static: [
            {
                directory: path.resolve(__dirname, '../public'), // 指向 public 目录
                publicPath: '/', // 访问路径（根路径）
            },
        ],
        open: true, // 启动后自动打开浏览器
        hot: true, // 启用模块热替换（HMR）
    },



};