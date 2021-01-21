"use strict";
const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vue_route_generator_1 = require("vue-route-generator");
const pluginName = 'VueAutoRoutingPlugin';
interface IOption {
  pages: string;
  moduleName: string;
}
class VueAutoRoutingPlugin {
    options: IOption[] | IOption;
    constructor(options: any) {
        this.options = options;
        if (Array.isArray(options)) {
            options.forEach(option => {
                assert(option.pages, '`pages` is required');
            });
        }
        else {
            assert(options.pages, '`pages` is required');
        }
    }
    apply(compiler: any) {
        const generate = () => {
            if (Array.isArray(this.options)) {
                let indexContent = ''
                this.options.forEach(option => {
                    const code = vue_route_generator_1.generateRoutes(option);
                    const to = path.resolve(__dirname, '../' + option.moduleName + '.js');
                    if (fs.existsSync(to) &&
                        fs.readFileSync(to, 'utf8').trim() === code.trim()) {
                        return;
                    }
                    indexContent += `import ${option.moduleName} from './${option.moduleName}.js';\n`
                    fs.writeFileSync(to, code);
                });
                if (indexContent !== '') {
                    indexContent += `export default {${this.options.map(option => option.moduleName).join(',')}}`
                }
                const indexPath = path.resolve(__dirname, '../index.js');
                if ((fs.existsSync(indexPath) &&
                    fs.readFileSync(indexPath, 'utf8').trim() === indexContent.trim()) || indexContent === '') {
                    return;
                }

                fs.writeFileSync(indexPath, indexContent);
            } else {
                const code = vue_route_generator_1.generateRoutes(this.options);
                const to = path.resolve(__dirname, '../' + (this.options.moduleName || 'index') + '.js');
                if (fs.existsSync(to) &&
                    fs.readFileSync(to, 'utf8').trim() === code.trim()) {
                    return;
                }
                fs.writeFileSync(to, code);
            }
        };
        compiler.hooks.thisCompilation.tap(pluginName, (compilation: any) => {
            try {
                generate();
            }
            catch (error) {
                compilation.errors.push(error);
            }
        });
    }
}
module.exports = VueAutoRoutingPlugin;
