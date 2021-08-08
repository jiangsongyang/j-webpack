const path = require('path')

module.exports = {
  /**
   * 处理 loader 方法
   * @param {*} source
   * @param {*} that Complier
   * @param {*} modulePath
   */
   handleLoader(source, that, modulePath) {
    // 处理 loader
    // 读取 rules 规则
    // 获取每一条 rule 与 modulePath 进行匹配
    // 倒叙遍历
    for (let index = that.rules.length - 1; index >= 0; index--) {
      const rule = that.rules[index]
      const test = rule.test
      const use = rule.use

      // modulePath 满足正则规则
      // 倒叙处理注册 loader
      if (test.test(modulePath)) {
        // use is Array
        if (Array.isArray(use)) {
          for (let j = use.length - 1; j >= 0; j--) {
            const loader = require(path.join(that.root, use[j]))
            // loader 执行
            source = loader(source)
          }
        }
        // use is String
        else if (typeof use === 'string') {
          const loader = require(path.join(that.root, use))
          source = loader(source)
        }
        // use is Object
        else {
          const loader = require(path.join(that.root, use.loader))
          source = loader.call({ query: use.options }, source)
        }
      }
    }
    return source
  },
}
