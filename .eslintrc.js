module.exports = {
    env: {
        browser: true,  // 表示代码运行在浏览器环境
        es2021: true    // 表示代码使用 ES2021 及以下版本的语法特性
    },
    parserOptions: {
        ecmaVersion: "2021",  // 指定支持的 ECMAScript 语法版本
        sourceType: "module"  // 指定代码的模块类型
    },
    extends: [
        "eslint:recommended", // 或最新的 "js/recommended"
    ],
    rules: {
        // 禁止未使用的变量
        "no-unused-vars": ["warn", {
            vars: "all",  
            args: "after-used"
        }],
    }
}