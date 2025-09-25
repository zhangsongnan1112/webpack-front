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
Babel 的主要作用：将新的 JavaScript 语法转换为旧版本浏览器能够理解的语法。
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




 