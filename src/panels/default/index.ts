import { readdirSync, readFileSync, statSync } from 'fs-extra';
import { extname, join } from 'path';
import { createApp, App } from 'vue';
const panelDataMap = new WeakMap<any, App>();
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
    template: readFileSync(join(__dirname, '../../../static/template/default/index.html'), 'utf-8'),
    style: readFileSync(join(__dirname, '../../../static/style/default/index.css'), 'utf-8'),
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
            const app = createApp({
                data() {
                    return {
                        fileCount: {},
                        fileNum: 0,
                    }
                },
                methods: {
                    checkAssets() {
                        let fileCount: {[key: string]: number} = {};
                        let fileNum = 0;
                        let assetsPath = join(Editor.Project.path, "assets");
                        let checkDir = (dirPath: string) => {
                            let files = readdirSync(dirPath);
                            files.forEach((fileName) => {
                                let subPath = join(dirPath, fileName);
                                let stat = statSync(subPath);
    
                                if (stat.isDirectory()) {
                                    checkDir(subPath);
                                }
                                else if (stat.isFile()) {
                                    let extName = extname(fileName);
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
                            })
                        }
    
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
                template: readFileSync(join(__dirname, '../../../static/template/vue/counter.html'), 'utf-8'),
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
