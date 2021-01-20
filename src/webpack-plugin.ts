import * as assert from 'assert'
import * as fs from 'fs'
import * as path from 'path'
import { Compiler } from 'webpack'
import { generateRoutes, GenerateConfig } from 'vue-route-generator'

const pluginName = 'VueAutoRoutingPlugin'

interface Options extends GenerateConfig {
  outFile?: string;
  moduleName?: string;
}

namespace VueAutoRoutingPlugin {
  export type AutoRoutingOptions = Options
}

class VueAutoRoutingPlugin {
  constructor(private options: Options | Options[]) {
    if (Array.isArray(options)) {
      options.forEach(option => {
        assert(option.pages, '`pages` is required')
      })
    } else {
      assert(options.pages, '`pages` is required')
    }
  }

  apply(compiler: Compiler) {
    const generate = () => {
      let data: any = {}
      if (Array.isArray(this.options)) {
        this.options.forEach(option => {
          const code = generateRoutes(option)
          if (option.moduleName) {
            data[option.moduleName] = code
          }
        })
      } else {
        const code = generateRoutes(this.options)
        if (this.options.moduleName) {
          data[this.options.moduleName] = code
        } else {
          data = code
        }
      }
      const to = path.resolve(__dirname, '../index.js')
      data = JSON.stringify(data)
      if (
        fs.existsSync(to) &&
        fs.readFileSync(to, 'utf8').trim() === data.trim()
      ) {
        return
      }

      fs.writeFileSync(to, data)
    }

    compiler.hooks.thisCompilation.tap(pluginName, (compilation) => {
      try {
        generate()
      } catch (error) {
        compilation.errors.push(error)
      }
    })
  }
}

export = VueAutoRoutingPlugin
