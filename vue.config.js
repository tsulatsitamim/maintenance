const CopyWebpackPlugin = require('copy-webpack-plugin')

module.exports = {
  configureWebpack: {
    plugins: [
      new CopyWebpackPlugin([
        {
          from: 'node_modules/metronic-vue/dist/media',
          to: 'media/',
        },
      ]),
    ],
  },
  devServer: {
    disableHostCheck: true,
    port: 11005,
  },
  publicPath:
    process.env.NODE_ENV === 'production'
      ? '/maintenance-dev'
      : '/maintenance-dev',
  transpileDependencies: ['vue-echarts', 'resize-detector'],
}
