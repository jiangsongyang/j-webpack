const path = require('path')

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    fileName: 'bundle.js',
  },
  module: {
    rules: [
      {
        test: /.js$/,
        use: '../loaders/jsy-loader.js', // 普通 loader
      },
      {
        test: /.js$/,
        use: ['../loaders/jsy-pre-loader.js'],
        enforce: 'pre', // 前置loader
      },
      {
        test: /.js$/,
        use: {
          loader: '../loaders/jsy-post-loader.js',
          options: {
            // 自定义配置
            // 通过 loader-utils .getOptions() 获取该options
            testOptions: true,
          },
        },
        enforce: 'post', // 后置loader
      },
    ],
  },
  mode: 'development',
}
