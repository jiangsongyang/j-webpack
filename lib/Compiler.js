const fs = require('fs')
const path = require('path')
const parser = require('@babel/parser') // 生成AST的库
const traverse = require('@babel/traverse').default // 替换AST中属性的库 ES6方法导出
const generator = require('@babel/generator').default // AST 2 CODE
const ejs = require('ejs')
const { handleLoader } = require('./HandleLoader')
const { SyncHook } = require('tapable')

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
    // option 中的 loader config
    this.rules = config.module.rules
    // 注册生命周期钩子
    this.hooks = {
      compile: new SyncHook(),
      afterCompile: new SyncHook(),
      emit: new SyncHook(),
      afterEmit: new SyncHook(),
      done: new SyncHook(),
    }
    // 注册plugins
    if (Array.isArray(this.config.plugins)) {
      // 调用当前plugin的apply方法
      this.config.plugins.forEach((plugin) => plugin.apply(this))
    }
  }
  /**
   * 开始打包方法
   * 依赖分析
   */
  start() {
    // 开始编译hook触发
    this.hooks.compile.call()
    this.depAnalse(path.resolve(this.root, this.entry))
    // 结束编译hook触发
    this.hooks.afterCompile.call()
    this.hooks.emit.call()
    this.emitFile()
    this.hooks.afterEmit.call()
    this.hooks.done.call()
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
    let source = this.getFileSource(modulePath)

    // 处理loader
    source = handleLoader(source, this, modulePath)

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
