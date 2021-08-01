#!/usr/bin/env node

// #!/usr/bin/env node 这行的作用是
// 可以在命令行中直接使用 bin 的命令运行该文件
// 需要npm link到全局

/**
 *  TODO
 *  1 . 获取配置文件 webpacj.config.js
 *  2 . 通过面向对象的方式进行项目推进
 */

// get config
const path = require('path')
const config = require(path.resolve('j.webpack.config.js'))
const Compiler = require('../lib/Compiler.js')

new Compiler(config).start()

