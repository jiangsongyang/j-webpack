module.exports = function (source) {
  source = `
  ${source}

  // this.query is ${this.query.testOptions}
  `
  return source
}
