// loader 就是一个 function
// 接受参数为 source code

module.exports = function (source) {
  source = `
  // this is jsy-loader

  ${source}
  `
  return source
}
