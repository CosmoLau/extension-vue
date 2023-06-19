"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_extra_1 = require("fs-extra");
const path_1 = require("path");
const vue_1 = require("vue");
const panelDataMap = new WeakMap();
/**
 * @zh 如果希望兼容 3.3 之前的版本可以使用下方的代码
 * @en You can add the code below if you want compatibility with versions prior to 3.3
 */
// Editor.Panel.define = Editor.Panel.define || function(options: any) { return options }
module.exports = Editor.Panel.define({
    listeners: {
        show() { console.log('show'); },
        hide() { console.log('hide'); },
    },
    template: (0, fs_extra_1.readFileSync)((0, path_1.join)(__dirname, '../../../static/template/default/index.html'), 'utf-8'),
    style: (0, fs_extra_1.readFileSync)((0, path_1.join)(__dirname, '../../../static/style/default/index.css'), 'utf-8'),
    $: {
        app: '#app',
        text: '#text',
    },
    methods: {
        hello() {
            if (this.$.text) {
                this.$.text.innerHTML = 'hello';
                console.log('[cocos-panel-html.default]: hello');
            }
        },
    },
    ready() {
        if (this.$.text) {
            this.$.text.innerHTML = 'Hello Cocos.';
        }
        if (this.$.app) {
            const app = (0, vue_1.createApp)({
                data() {
                    return {
                        fileCount: {},
                        fileNum: 0,
                    };
                },
                methods: {
                    checkAssets() {
                        let fileCount = {};
                        let fileNum = 0;
                        let assetsPath = (0, path_1.join)(Editor.Project.path, "assets");
                        let checkDir = (dirPath) => {
                            let files = (0, fs_extra_1.readdirSync)(dirPath);
                            files.forEach((fileName) => {
                                let subPath = (0, path_1.join)(dirPath, fileName);
                                let stat = (0, fs_extra_1.statSync)(subPath);
                                if (stat.isDirectory()) {
                                    checkDir(subPath);
                                }
                                else if (stat.isFile()) {
                                    let extName = (0, path_1.extname)(fileName);
                                    if (extName != "" && !fileCount[extName]) {
                                        fileCount[extName] = 1;
                                    }
                                    else if (extName != "" && fileCount[extName]) {
                                        fileCount[extName] += 1;
                                    }
                                    else {
                                        if (fileCount["other"]) {
                                            fileCount["other"] += 1;
                                        }
                                        else {
                                            fileCount["other"] = 1;
                                        }
                                    }
                                    fileNum++;
                                }
                            });
                        };
                        checkDir(assetsPath);
                        this.fileCount = fileCount;
                        this.fileNum = fileNum;
                    }
                },
                beforeMount() {
                    this.checkAssets();
                }
            });
            app.config.compilerOptions.isCustomElement = (tag) => tag.startsWith('ui-');
            app.component('MyCounter', {
                template: (0, fs_extra_1.readFileSync)((0, path_1.join)(__dirname, '../../../static/template/vue/counter.html'), 'utf-8'),
                data() {
                    return {
                        counter: 0,
                    };
                }, methods: {
                    addition() {
                        this.counter += 1;
                    },
                    subtraction() {
                        this.counter -= 1;
                    },
                },
            });
            app.mount(this.$.app);
            panelDataMap.set(this, app);
        }
    },
    beforeClose() { },
    close() {
        const app = panelDataMap.get(this);
        if (app) {
            app.unmount();
        }
    },
});
