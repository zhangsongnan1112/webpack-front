const path = require('path')
const os = require('os')
const ESLintPlugin = require('eslint-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const cpuLen = os.cpus().length  //  获取cpu核数

module.exports = {
    // 相对路径
    entry: './src/main.js',
    // 绝对路径
    output: {
        path: path.resolve(__dirname, '../dist'),
        // 入口文件输出的文件名
        filename: 'js/main.js',
    },
    module: {
        rules: [
            {
                oneOf: [
                    {
                        test: /\.css$/i,
                        use: ['style-loader', 'css-loader'],
                    },
                    {
                        test: /\.s[ac]ss$/i,
                        use: ['style-loader', 'css-loader', "sass-loader"],
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
                                    cacheDirectory: true,
                                }
                            }
                        ]
                       ,
                        include: path.resolve(__dirname, '../src'),
                    },
                ]
            }

        ]
    },
    plugins: [
        new ESLintPlugin({
            // 检测哪些文件
            context: './src',
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
        )
    ],
    devServer: {
        port: 3000, // 端口号（默认 8080）
        open: true, // 启动后自动打开浏览器
        hot: true, // 启用模块热替换（HMR）
        compress: true, // 启用 gzip 压缩
        static: '../public', // 静态资源目录（如 HTML、图片等）
        proxy:
            [
                {
                    context: ['/api', '/auth'],  // 匹配需要代理的路径（可多个）
                    target: 'http://localhost:5000',  // 后端接口地址
                    changeOrigin: true,  // 允许跨域
                    pathRewrite: { '^/api': '' }  // 重写路径（可选）
                },
            ],
        client: {
            overlay: true, // 编译错误时在浏览器全屏显示错误
            progress: true // 在浏览器状态栏显示编译进度
        }
    },
    mode: 'development',
    devtool: 'eval-cheap-module-source-map', // 开发环境推荐 给错误提示
    cache: {
        type: 'filesystem',
        cacheDirectory: path.resolve(__dirname, '.dev-cache'),
        buildDependencies: { config: [__filename] } // 配置变化时缓存失效
    }
}