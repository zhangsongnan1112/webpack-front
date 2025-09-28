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