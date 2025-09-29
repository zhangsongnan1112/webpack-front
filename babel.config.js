module.exports = {
    presets: [
        [
            '@babel/preset-env',  // preset 名称
            {                     // 该 preset 的选项
                useBuiltIns: "usage",
                corejs: 3,
                // 新增：强制所有 ES6+ 特性转译为 ES5，忽略浏览器是否支持
                forceAllTransforms: true,  // 如果用的是chrome它默认支持es6 的语法 他就不会进行转换，不管支持不支持全部转换
            }
        ]
    ] ,
    plugins: [
        [
            '@babel/plugin-transform-runtime', // 减少打包的体积
        ]
    ]
}