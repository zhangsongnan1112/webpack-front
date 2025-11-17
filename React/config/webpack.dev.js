const ESLintPlugin = require('eslint-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
//  做react热更新的 
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const path = require('path')


module.exports = {
    entry: './src/main.js',
    output: {
        path: undefined,
        filename: 'static/js/[name].js', 
        chunkFilename: 'static/js/[name].chunk.js',  // 如异步加载的模块、公共依赖拆分的 chunk
        assetModuleFilename: 'static/medic/[name][hash:6][ext][query]',  // 资源模块（如图片、字体等，通过 type: 'asset' 处理的文件）的命名规则
    },
    module: {
        rules: [
            // 处理css 
            {
                test: /\.css$/i,
                use: ["style-loader", "css-loader", {
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
                use: ["style-loader", "css-loader", {
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
                    plugins: ['react-refresh/babel'] // ✅ 正确位置
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
        new ReactRefreshWebpackPlugin()  //  // 启动react 🔥更新
    ],
    resolve: {
        extensions: ['.jsx', '.js', '.json'] // 按优先级解析后缀
    },
    mode: 'development',
    devtool: 'eval-cheap-module-source-map',
    optimization: {
        splitChunks: {
            chunks: 'all',
        }
    },
    devServer: {
        open: true, // 启动后自动打开浏览器
        hot: true, // 启用模块热替换（HMR）
    },

};