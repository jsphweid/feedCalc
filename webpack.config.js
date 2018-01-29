const webpack = require('webpack')
const path = require('path')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
const CopyWebpackPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')

const plugins = [
    new webpack.optimize.UglifyJsPlugin(),
    new CopyWebpackPlugin([
        { from: 'src/toastr.css', to: 'toastr.css' }
    ]),
    new HtmlWebpackPlugin({
        title: 'feedCalc',
        template: 'src/index.html'
    })
]

if (process.env.NODE_ENV === 'fakerun') {
    plugins.push(new BundleAnalyzerPlugin)
}

module.exports = {
    devtool: 'cheap-module-source-map',
    entry: {
        app: ['./src/feedByRandom.js']
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle-[chunkhash].js'
    },
    resolve: {
        extensions: [".js", ".json", ".css", ".scss"],
        modules: [
            path.resolve('./src/index'),
            'node_modules'
        ]
    },

    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            },
            {
                test: /\.html$/,
                use: 'html-loader'
            },
            {
                test: /\.(svg|png|jpg|gif)$/,
                use: [{ loader: 'url-loader' }]
            }
        ]
    },

    plugins: plugins
}
