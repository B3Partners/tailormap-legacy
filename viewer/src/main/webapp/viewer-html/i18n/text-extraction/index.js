const replace = require('replace-in-file');
const fs = require('fs');

class TextExtractor {

    constructor() {
        this.ouputFilename = "../locales/nl.json";
        this.store = {};
        this.match_count = 0;
        fs.readFile(this.ouputFilename, 'utf8', (err, data) => {
            if(!err) {
                try {
                    this.store = JSON.parse(data);
                } catch(e) {
                    console.error(e);
                };
            }
            this.createCountStore();
            this.extractText();
        });
    }

    createCountStore() {
        this.count_store = {};
        for(const key in this.store) if(this.store.hasOwnProperty(key)) {
            const basename = key.substring(0, key.lastIndexOf("_"));
            const count = parseInt(key.substring(key.lastIndexOf("_") + 1));
            if (!this.count_store.hasOwnProperty(basename) || this.count_store[basename] < count) {
                this.count_store[basename] = count + 1;
            }
        }
    }

    writeFile() {
        const ordered_store = {};
        Object.keys(this.store).sort().forEach((key) => {
            ordered_store[key] = this.store[key];
        });
        const json_content = JSON.stringify(ordered_store, null, 4);
        fs.writeFile(this.ouputFilename, json_content, (err) => {
            if(err) {
                return console.log(err);
            }
        });
    }

    getKey(filename, filecontents) {
        const classNameMatches = filecontents.match(/Ext\.define\s*\(["'](viewer\.[^'"]*)["']/);
        const className = classNameMatches[1];
        let keyname = "";
        if (className) {
            keyname = className.replace(/[\.\-]/g, "_").toLowerCase();
        } else {
            keyname = filename.substring(filename.lastIndexOf("/") + 1).replace(/\-/g, "_").replace(".js", "").toLowerCase();
        }
        if (!this.count_store.hasOwnProperty(keyname)) {
            this.count_store[keyname] = 0;
        }
        return `${keyname}_${this.count_store[keyname]++}`;
    }

    extractText() {
        const defaultOpts = {
            files: [
                '../../common/**/*.js',
                '../../components/**/*.js'
            ],
            ignore: [
                '../../common/openlayers/OpenLayers.js'
            ],
        };
        const propReplacer = {
            ...defaultOpts,  
            from: /(text|title|tooltip|fieldLabel|emptyText|boxLabel|msg|header|html):\s?(["'])(?:(?=(\\?))\3.)*?\2/g,
            to: (...args) => {
                const match = args[0];
                const filecontents = args[args.length - 2];
                const filename = args[args.length - 1];
                let text = match.replace(/(text|title|tooltip|fieldLabel|emptyText|boxLabel|msg|header|html)\s*:\s*['"]/, "");
                text = text.substring(0, text.length - 1);
                if (!text) {
                    return match;
                }
                const key = this.getKey(filename, filecontents);
                this.store[key] = text;
                this.match_count++;
                return match.replace(/(text|title|tooltip|fieldLabel|emptyText|boxLabel|msg|header|html):\s?['"].*/, "$1: i18next.t('" + key + "')");
            },
        };
        const msgBoxReplacer = {
            ...defaultOpts,
            from: /Ext\.(Msg|MessageBox)\.(alert|confirm)\(["']{1}([^'"]*)["']{1}, ["']{1}([^'"]*)["']{1}/g,
            to: (...args) => {
                const match = args[0];
                const filecontents = args[args.length - 2];
                const filename = args[args.length - 1];
                const type = args[2];
                const text1 = args[3];
                const text2 = args[4];
                if (!text1 && !text2) {
                    return match;
                }
                let replaced = `Ext.MessageBox.${type}(`;
                if (text1) {
                    const key = this.getKey(filename, filecontents);
                    this.store[key] = text1;
                    replaced += "i18next.t('" + key + "')";
                } else {
                    replaced += text1;
                }
                replaced += ", ";
                if (text2) {
                    const key = this.getKey(filename, filecontents);
                    this.store[key] = text2;
                    replaced += "i18next.t('" + key + "')";
                }
                this.match_count++;
                return replaced;
            },
        };
        const loadingReplacer = {
            ...defaultOpts,
            from: /setLoading(["']{1}([^'"]*)["']{1})/g,
            to: (...args) => {
                const match = args[0];
                const text = args[1];
                const filecontents = args[args.length - 2];
                const filename = args[args.length - 1];
                if (!text) {
                    return match;
                }
                const key = this.getKey(filename, filecontents);
                this.store[key] = text;
                this.match_count++;
                return "setLoading(i18next.t('" + key + "'))";
            },
        };
        try {
            replace.sync(propReplacer);
            replace.sync(msgBoxReplacer);
            replace.sync(loadingReplacer);
            this.writeFile();
            console.log("Total replacements: ", this.match_count);
        }
        catch(error) {
            console.error("An error occurred: ", error);
        }
    }

}

new TextExtractor();