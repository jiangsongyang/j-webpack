module.exports = function (source) {
  source = `
  // this is jsy-pre-loader

  ${source}
  `
  return source
}
