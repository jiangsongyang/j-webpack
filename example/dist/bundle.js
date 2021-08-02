;(function (modules) {
  // the module cache
  var installedModules = {}

  function __webpack_require__(moduleId) {
    // check cache
    if (installedModules[moduleId]) {
      return installedModules[moduleId].exports
    }

    var module = (installedModules[moduleId] = {
      i: moduleId,
      l: false,
      exports: {},
    })

    modules[moduleId].call(
      module.exports,
      module,
      module.exports,
      __webpack_require__
    )

    module.l = true

    return module.exports
  }

  return __webpack_require__(__webpack_require__.s = './src/index.js')
})({
  
    "./src/module1.js":
    (
      function (module , exports , __webpack_require__){
        eval(`// this is jsy-loader
// this is jsy-pre-loader
module.exports = {
  str1: 'this is module 1'
}; // this.query is true`)
      }
    ),
  
    "./src/index.js":
    (
      function (module , exports , __webpack_require__){
        eval(`// this is jsy-loader
// this is jsy-pre-loader
const module1 = __webpack_require__("./src/module1.js");

console.log('this is index.js');
console.log(module1.str1); // this.query is true`)
      }
    ),
  
})
