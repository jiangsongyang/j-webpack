module.exports = class HtmlWebpackPlugin {
  constructor(option) {
    // 获取 template & fileName
    this.option = option
  }

  apply(compiler) {
    compiler.hooks.afterEmit.tap('HTML_WEBPACK_PLUGIN', (compilations) => {
      
    })
  }
}
