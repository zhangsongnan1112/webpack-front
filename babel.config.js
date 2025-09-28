module.exports = {
    presets: ['@babel/preset-env'],
    plugins: [
        [
            '@babel/plugin-transform-runtime', // 减少打包的体积
        ]
    ]
}