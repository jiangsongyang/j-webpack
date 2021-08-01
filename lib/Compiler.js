const fs = require('fs')
const path = require('path')
const parser = require('@babel/parser') // 生成AST的库
const traverse = require('@babel/traverse').default // 替换AST中属性的库 ES6方法导出
const generator = require('@babel/generator').default // AST 2 CODE
const ejs = require('ejs')

/**
 * 解析方法
 * @config webpack config Object
 */
module.exports = class Compiler {
  constructor(config) {
    this.config = config
    this.entry = config.entry
    // 相对 process.cwd 路径获取 path
    // 执行命令时的目录
    this.root = process.cwd()
    // 一个空对象 存放所有模块
    this.modules = {}
  }
  /**
   * 开始打包方法
   * 依赖分析
   */
  start() {
    this.depAnalse(path.resolve(this.root, this.entry))
    this.emitFile()
  }
  emitFile() {
    // 获取 生成文件模板
    const template = this.getFileSource(
      path.join(__dirname, '../template/outPut.ejs')
    )

    // 给模板赋值
    const res = ejs.render(template, {
      entry: this.entry,
      modules: this.modules,
    })

    // 获取最终输出目录 , 拼接
    const outPutPath = path.join(
      this.config.output.path,
      this.config.output.fileName
    )

    // 生成 bundle
    fs.writeFileSync(outPutPath, res)
  }
  /**
   * 依赖分析方法
   * @modulePath 需要收集的模块的路径
   */
  depAnalse(modulePath) {
    // 依赖数组
    const depArray = []

    // 读取模块文件内容
    const source = this.getFileSource(modulePath)

    // 生成 AST
    // @babel/parse
    const AST = parser.parse(source, {
      sourceType: 'module',
    })

    // 替换 require 关键字
    // @babel/traverse
    traverse(AST, {
      CallExpression(p) {
        // 找 require 关键字
        if (p.node.callee.name === 'require') {
          // 替换require方法 -> __webpack_require__
          p.node.callee.name = '__webpack_require__'
          // 修改路径
          // 如果有require 就把require的路径替换
          const oldValue = p.node.arguments[0].value
          // 避免 windows 出现 \ 全部替换成 /
          p.node.arguments[0].value = `./${path.join('src', oldValue)}`.replace(
            /\\+/g,
            '/'
          )
          // 每找到一个 require
          // 更改path结束后
          // 收集依赖
          depArray.push(p.node.arguments[0].value)
        }
      },
    })

    // 生成代码
    // @babel/generator
    const code = generator(AST).code

    // 递归加载所有依赖
    // dep 为依赖路径
    depArray.forEach((dep) =>
      // 修改路径后 递归分析依赖
      this.depAnalse(path.resolve(this.root, dep))
    )

    // 获取相对路径
    let modulePathRelative = `./${path.relative(
      this.root,
      modulePath
    )}`.replace(/\\+/g, '/')
    // 构建 modules 对象
    this.modules[modulePathRelative] = code
  }
  /**
   * 获取指定路径文件内容
   * @path 读取文件路径
   */
  getFileSource(path) {
    return fs.readFileSync(path, 'utf-8')
  }
}
