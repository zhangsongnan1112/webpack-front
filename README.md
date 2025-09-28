webpack是一个静态资源的打包工具， 它会以一个或多个文件为打包入口，将我们整个项目编译组合成一个或多个文件输出出去， 输出的文件就是编译好的文件，就可以在浏览器运行了。我们将webpack 输出的文件叫做buldle.

```
 npx  webpack  ./main.js --mode=development
```
```
// base.js
export function sayHello() {
    console.log('Hello from base.js!');
    document.body.innerHTML += '<p>模块加载成功！</p>';
}
直接引入会报错 ，因为使用了export es6 的语法，webpack 不能处理es6的语法,webpack 打包引入打包之后的文件
<script  src="dist/main.js"></script>

```

1. entry (入口) 指示webpack 从哪个文件开始打包
2. output (输出) 打包完的文件输出到哪里去
3. loader (加载器)webpack 本身只能处理js json文件，其他资源需要使用loader,webpack才能解析
4. plugins (插件) 扩展webpack 功能
5. mode (模式) 主要有两种模式 开发模式:development 生产模式:production

在页面根目录创建webpack.config.js(必须是根目录)需要使用common.js语法 module.exports = {}

```
const path = require('path')
module.exports = {
    // 相对路径
    entry: './main.js',
    // 绝对路径
    output: {
        path: path.resolve(__dirname,'dist'),
        filename: 'main.js'
    },
    module: {
        rules: []
    },
    plugins: [],
    mode: 'development'
}
```
###  css scss sass 资源处理
- css-loader 解析CSS中的依赖关系（处理 @import 和 url()）。并将 CSS 转换为 Webpack 可识别的模块。 将 CSS 转换为 CommonJS 模块
- style-loader 将处理后的 CSS 代码注入到 HTML 页面的 style 标签中，使样式生效
- sass-loader 将 SASS/SCSS 代码编译为普通 CSS 代码
```
 rules: [
    {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
    },
    {
        test: /\.s[ac]ss$/i,
        use: ['style-loader', 'css-loader', "sass-loader"],
    }
]

```

###  图片字段处理 
引入图片直接打包也是可以打包好的，因为它已经引入到了 webpack5里面了,但是是原封不动的输出的，如果想将小于5kb、10kb转成base64需要配置
##### webpack4
- file-loader： 将文件、图片发送到输出目录，并且返回url 
- url-loader: 与 file-loader 类似，但可以设置一个限制（limit），小于该大小的文件会转为 Base64，大于的则交给 file-loader 处理。
##### webpack5
- asset	按大小自动选择	通用图片处理	url-loader + file-loader
- asset/resource	总是输出文件	大图片、字体文件	file-loader
- asset/inline	总是内联base64	小图标、SVG图标	url-loader（无limit）
- asset/source	导出源码字符串	文本文件、配置文件	raw-loader
```
// 1. 图片：智能模式（推荐）
{
    test: /\.(png|jpe?g|gif|webp)$/i,
    type: 'asset',
    parser: {
        dataUrlCondition: {
        maxSize: 10 * 1024 // 10KB阈值
        }
    },
    generator: {
        filename: 'images/[name].[hash:6][ext]'
    }
},
// 2. SVG：总是内联（SVG通常很小且适合内联）
{
    test: /\.svg$/i,
    type: 'asset/inline'
},
// 3. 字体：总是输出文件（字体文件通常较大）
{
    test: /\.(woff2?|eot|ttf|otf)$/i,
    type: 'asset/resource',
    generator: {
        filename: 'fonts/[name].[hash:6][ext]'
    }
},
// 4. 文本文件：导出源码
{
    test: /\.(txt|md|csv)$/i,
    type: 'asset/source'
}
```

Webpack 4(loader):  file-loader / url-loader , 需要单独安装 loader, Base64 转换:url-loader 的 limit 选项
Webpack 5 (资源模块): type: 'asset',内置，无需安装, Base64 转换:parser.dataUrlCondition.maxSize
```
{
    test: /\.(png|jpe?g|webp|svg|gif)$/i,
    type: 'asset',
    parser: {
        dataUrlCondition: {
            maxSize: 10 * 1024 // 4kb
        }
    },
    generator: {
        filename: 'images/[name].[hash:6][ext]'
    }
}
```
### 自动清除上次打包内容
```
clean : true
```

### 项目中使用eslint 
> eslint v9 版本改动很大, 不支持 .eslintrc.js 文件, 统一改成了 eslint.config.js。同时不支持extends: ["eslint:recommended"], 变成了 js.configs.recommended。 当eslint版本降低到 9以下（@8.56.0）， eslint-webpack-plugin也需要在3点多（@3.2.0），要不然会报错。

```
npm install eslint-webpack-plugin@3.2.0 eslint@8.56.0 --save-dev
// 不制定版本的时，eslint 默认下载9以上，eslint-webpack-plugin5以上
```
```
const ESLintPlugin = require('eslint-webpack-plugin');
plugins: [new ESLintPlugin({
    context: './src'
})],
```

### babel 
Babel 的主要作用：将新的 JavaScript 语法转换为旧版本浏览器能够理解的语法
npm install -D babel-loader @babel/core @babel/preset-env     
###### 工作原理
- 解析（Parse）：将源代码解析为抽象语法树（AST）。
- 转换（Transform）：对 AST 进行修改（如替换新语法节点为旧语法节点）。
- 生成（Generate）：将修改后的 AST 转换为目标代码（低版本 JS）。


###### ES6+ 核心语法转换
- let/const → 转换为 var（配合块级作用域兼容）
- 解构赋值（const { a } = obj）→ 转换为传统变量赋值
- 扩展运算符（...arr）→ 转换为数组 / 对象合并的兼容代码
- 剩余参数（function(...args) {}）→ 转换为 arguments 处理
- 箭头函数（() => {}）→ 转换为 function() 普通函数（处理 this 绑定）
- class 类声明（class A {}）→ 转换为 ES5 构造函数（function A() {}）
- extends 继承（class B extends A {}）→ 转换为原型链继承代码
- import/export → 转换为 CommonJS（require/module.exports）
- 模板字符串（`Hello ${name}`）→ 转换为 + 拼接的字符串
- for...of 循环 → 转换为 for 循环配合迭代器

```
{
    test: /\.js$/,
    // 排除检查项
    exclude: /(node_modules)/,
    use: {
        loader: 'babel-loader',
    },
}
// 在babel.config.js里面配置babel预设
module.exports = {
    presets: ['@babel/preset-env'],
}
```
### 处理 html 资源
自动生成或处理 HTML 文件，并自动注入 Webpack 打包后的 JS、CSS 等资源，解决手动管理资源路径的痛点。

- 可以基于一个模板文件（如 public/index.html）生成最终的 HTML，无需手动编写。
- 自动将 Webpack 打包后的 JS、CSS 等资源（含哈希值）注入到 HTML 中，避免手动写 script或link 标签。

```
const HtmlWebpackPlugin = require('html-webpack-plugin');
new HtmlWebpackPlugin(
    {
        template: path.resolve(__dirname, 'public/index.html'),
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
```

### 搭建开发服务
用于快速搭建本地开发服务器，支持实时重新加载（live reloading） 和模块热替换（HMR），大幅提升开发效率
npm install webpack-dev-server -D
```

devServer: {
    port: 3000, // 端口号（默认 8080）
    open: true, // 启动后自动打开浏览器
    hot: true, // 启用模块热替换（HMR）
    compress: true, // 启用 gzip 压缩
    static: './public', // 静态资源目录（如 HTML、图片等）
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
```
### 生产模式准备
创建 config 文件夹 
开发模式配置文件 webpack.config.dev.js
生产模式配置文件 webpack.config.prod.js
```
// 配置命令
"scripts": {
    "start": "npm run dev",
    "dev": "webpack server --config config/webpack.config.dev.js",
    "build": "webpack --config config/webpack.config.dev.js"
},
```

### 将css文件单独的抽离出来
npm install --save-dev mini-css-extract-plugin
> 将 CSS 从 JS 文件中提取为独立 CSS 文件的插件， 解决了 CSS 内联在 JS 中的各种问题（如阻塞 JS 执行、体积过大等）。

#### 好处
- 并行加载： 浏览器可以同时加载 HTML、JS 和 CSS 文件（多线程并行请求），而不是等待 JS 加载完成后再动态插入 CSS（style-loader 的方式）。
- 减少阻塞：CSS 独立加载时，不会阻塞 JS 执行；而内联在 JS 中的 CSS 需等待 JS 解析后才会生效，可能导致页面 “闪屏”（先显示无样式内容，再加载样式）。
- CSS 单独缓存： 通过 [contenthash] 配置（如 style.[contenthash].css），当 CSS 内容不变时，哈希值不变，浏览器会长期缓存
- 减小 JS 文件体积： 大型项目中，CSS 代码可能占据大量体积。提取为独立文件后，JS 包体积显著减小，加快 JS 下载和解析速度，提升首屏渲染效率。
- 支持 CSS 预加载：  独立的 CSS 文件可以通过 <link rel="preload"> 

生产环境：强烈推荐使用 mini-css-extract-plugin: CSS 与 JS 分离，并行加载，提升页面性能, 支持 CSS 单独缓存（通过 contenthash）
开发环境：建议继续使用 style-loader: 支持热模块替换（HMR），修改 CSS 后无需刷新页面即可生效；

```
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
在处理css 文件和scss 文件时不能用style-loader 改成 MiniCssExtractPlugin.loader
{
    test: /\.css$/i,
    use: [MiniCssExtractPlugin.loader, 'css-loader'],
},
{
    test: /\.s[ac]ss$/i,
    use: [MiniCssExtractPlugin.loader, 'css-loader', "sass-loader"],
},
new MiniCssExtractPlugin({
    // 输出的 CSS 文件名（支持 [name]、[contenthash] 等占位符）
    filename: 'css/[name].[contenthash].css',
    // 非入口的 chunk 对应的 CSS 文件名（如代码分割产生的 CSS）
    chunkFilename: 'css/[name].[contenthash].chunk.css'
})

```

### CSS 兼容性
npm install --save-dev postcss-loader postcss postcss-preset-env
```
// css-loader 之后 sass-loader 之前
{
    test: /\.s[ac]ss$/i,
    use: [MiniCssExtractPlugin.loader, 
        'css-loader', 
        {
            loader: 'postcss-loader',
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
        "sass-loader"],
},
package.json 增加
"browserslist": [
    "last 2 versions",
    "> 1%",
    "not dead"
]
```

### 封装样式Loader函数
```
const getLoader = (loader) => {
    return [
        MiniCssExtractPlugin.loader,
        'css-loader',
        {
            loader: 'postcss-loader',
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
 module: {
    rules: [
        {
            test: /\.css$/i,
            use: getLoader()
        },
        {
            test: /\.s[ac]ss$/i,
            use: getLoader('sass-loader')
        },
    ]
 }

```

### css的简单压缩
html和js 在mode === production 会自动被压缩不需要额外配置
```
npm install css-minimizer-webpack-plugin --save-dev
plugins:[
    new CssMinimizerPlugin()
]
```
### sourceMap
sourceMap（源代码映射）是一种将打包 / 压缩后的代码映射回原始源代码的技术，主要用于开发和调试阶段。能帮助开发者在调试时看到原始的、未处理的代码，极大提升调试效率。

```
// webpack.dev.js
module.exports = {
  mode: 'development',
  devtool: 'eval-cheap-module-source-map', // 开发环境推荐
};
// webpack.prod.js
module.exports = {
  mode: 'production',
  devtool: 'source-map', // 生成完整 sourceMap（可选）
};
```    
### HMR （Hot Module Replacement，模块热替换）
是 Webpack 提供的一项开发环境优化功能，它允许在不刷新整个页面的情况下，替换、添加或删除模块，同时保留应用的当前状态（如表单输入、组件状态等），极大提升开发效率。
```
devServer: {
    hot: true, // 开启 HMR
    open: true, // 自动打开浏览器
    port: 3000
},
```
#### 工作原理
建立连接：webpack-dev-server 启动后，会与浏览器建立 WebSocket 连接，实时通信。
监听变化：Webpack 监听源代码文件，当文件修改时，重新编译修改的模块。
发送更新：通过 WebSocket 向浏览器发送 “更新通知” 和 “新模块代码”。
替换模块：浏览器接收新模块，在运行时替换旧模块，同时触发应用的重新渲染（但不刷新页面）。

### oneOf
> oneOf 是 module.rules 中的一个特殊配置项，用于优化模块匹配效率，确保一个文件只会被第一个匹配成功的 loader 规则处理，而不会继续检查后续规则。

为什么需要 oneOf？
- webpack 默认会遍历所有 module.rules 规则，对每个文件进行匹配检查（即使已经找到匹配的规则）。这在规则较多时会降低构建速度。
- oneOf 可以解决这个问题：它内部的规则是 “互斥” 的，文件一旦匹配到 oneOf 中的某条规则，就会停止检查后续规则，从而减少不必要的匹配次数，提升构建性能。
```
module: {
    rules: [
        {
            oneOf: [
                // 规则
            ]
        }
    ]
}
```

### include 和 exclude
module.rules 配置中，include 和 exclude 用于指定哪些文件需要被 loader 处理，或哪些文件需要被排除，通过精确控制处理范围来提升构建效率。
- include：仅处理符合条件的文件（白名单）
- exclude：排除符合条件的文件，不进行处理（黑名单）。  
值的说明：
可以是正则表达式（如 /node_modules/）
可以是绝对路径（如 path.resolve(__dirname, 'src')）
可以是数组（多个条件，如 include: [path1, path2]）
```
 rules: [
    {
    test: /\.js$/, 
    use: 'babel-loader', // 用 babel-loader 处理
    // 仅处理 src 目录下的 JS 文件（白名单）
    include: path.resolve(__dirname, '../src'),
    // 排除 node_modules 目录（黑名单，优先级低于 include）
    exclude: /node_modules/
    }
]
```
### 多进程打包 
webpack中 多进程大包是指并行处理构建任务，如代码转换、压缩等）来提升打包速度，
thread-loader 可以加速 loader 处理.是 Webpack 官方推荐的多进程工具，用于将耗时的 loader 任务（如 babel-loader、ts-loader）分配到 worker 进程中并行处理，避免
npm install thread-loader --save-dev
```
const os = require('os')
const cpuLen = os.cpus().length  //  获取cpu核数
{
test: /\.js$/,
// 排除检查项
exclude: /(node_modules)/,
use: [
    {
        loader: 'thread-loader',
        options: {
            workers: cpuLen -1
        }
    },
    {
        loader: 'babel-loader',
        options: {
            cacheDirectory: true,
        }
    },
],
include: path.resolve(__dirname, '../src'),
},
```
eslint 配置多线程
```
 new ESLintPlugin({
    context: './src',
    threads: cpuLen // 开启多进程
}),
```
js 压缩配置多线程
```
const TerserPlugin = require('terser-webpack-plugin');

 // 优化相关的
optimization: {
    minimizer: [
        new CssMinimizerPlugin(),
        new TerserPlugin(
            {
                parallel: cpuLen - 1
            }
        )
    ]
},
```

### TreeShaking 摇树 减少打包体积
Webpack 已默认集成这些配置（包括 terser-webpack-plugin），因此 Tree Shaking 会自动生效

treeShaking 两个核心的步骤： 
1. 标记未使用的代码： 依赖 ES6 模块的静态分析， 当mode: 'production'，Webpack 会分析代码，标记出未被使用的代码。
2. 删除未使用的代码：由 terser-webpack-plugin 完成。它会读取 Webpack 标记的未使用代码，在压缩过程中将其彻底删除

### 减少babel的打包体积
Babel 转换语法时会生成大量辅助函数（如 _createClass、_extends），默认会在每个文件中重复注入，导致代码冗余。babel-plugin-transform-runtime 可将这些辅助函数提取到单独的模块中复用。
npm install @babel/plugin-transform-runtime --save-dev
```
module.exports = {
    presets: ['@babel/preset-env'],
    plugins: [
        [
            '@babel/plugin-transform-runtime',
        ]
    ]
}
```

### 图片的压缩
```
npm install image-minimizer-webpack-plugin --save-dev
npm install imagemin-gifsicle imagemin-jpegtran imagemin-optipng imagemin-svgo --save-dev
npm install imagemin-gifsicle imagemin-mozjpeg imagemin-pngquant imagemin-svgo --save-dev
下载的时候可能有版本冲突 最终的下载版本 成功了 
"image-minimizer-webpack-plugin": "^4.0.0", // 需要4.0.0 这个版本以上就会和imagemin冲突
"imagemin": "^8.0.1",
"imagemin-gifsicle": "^7.0.0",
"imagemin-jpegtran": "^7.0.0",
"imagemin-mozjpeg": "^10.0.0",
"imagemin-optipng": "^8.0.0",
"imagemin-pngquant": "^10.0.0",
"imagemin-svgo": "^10.0.1",
```
```
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
```

### codeSplit 代码分割

SplitChunksPlugin 是 Webpack 内置的代码分割插件（无需额外安装），主要用于自动识别并提取项目中的公共代码、第三方库等，避免重复打包，从而减小整体 bundle 体积，提升加载性能。它是实现代码分割（Code Splitting）的核心工具之一

SplitChunksPlugin 的作用就是将这些重复的代码提取为单独的 chunk（文件），让所有依赖它的模块共享这一个文件，避免冗余。
```
// Webpack 4+ 已默认启用 SplitChunksPlugin，并提供了一套合理的默认配置
module.exports = {
  optimization: {
    splitChunks: {
      chunks: 'async', // 默认只处理异步 chunk（动态导入的模块）
      minSize: 20000, // 最小体积（字节）：只有大于这个值的 chunk 才会被分割
      minRemainingSize: 0,
      minChunks: 1, // 最少被引用次数：只有被至少 1 个模块引用才会被分割
      maxAsyncRequests: 30, // 异步加载时的最大并行请求数
      maxInitialRequests: 30, // 初始加载时的最大并行请求数
      enforceSizeThreshold: 50000,
      cacheGroups: { // 缓存组：用于自定义分割规则（核心）
        defaultVendors: { // 提取第三方库（如 node_modules 中的依赖）
          test: /[\\/]node_modules[\\/]/, // 匹配 node_modules 目录
          priority: -10, // 优先级（数值越大越优先）
          reuseExistingChunk: true, // 如果已存在相同的 chunk，直接复用
        },
        default: { // 提取业务代码中的共享模块
          minChunks: 2, // 最少被 2 个模块引用
          priority: -20,
          reuseExistingChunk: true,
        },
      },
    },
  },
};
```
```
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
    entry: {
        main: './src/main.js',
        add: './src/add.js'
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'js/[name].js',
        chunkFilename: 'js/[name].chunk.js',
        clean: true
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, './public/index.html'),
        })
    ],
    optimization: {
        splitChunks: {
            chunks: 'all', 
            minSize: 0
        }
    },
    mode: 'production'
}
```
####  codeSplit 代码分割

import 动态导入会自动的拆分为chunk 包
```
const btn = document.getElementById('btn')
btn.addEventListener('click', () => {
    // 配置chunk name
    import(/* webpackChunkName: "math" */'./math.js').then(res => {
        console.log(res, res.mathMin(1,4,0))
    })
})
```















 