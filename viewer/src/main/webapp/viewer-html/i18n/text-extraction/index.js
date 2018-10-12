const replace = require('replace-in-file');
const fs = require('fs');
const path = require('path');

class TextExtractor {

    constructor() {
        const languageFiles = [
            {
                outputFilename: "../locales/nl.json",
                fileOptions: {
                    files: [
                        '../../common/**/*.js',
                        '../../components/**/*.js'
                    ],
                    ignore: [
                        '../../common/openlayers/OpenLayers.js'
                    ],
                }
            },
            {
                outputFilename: "../../../../../../../viewer-admin/src/main/webapp/resources/i18n/locales/nl.json",
                fileOptions: {
                    files: [
                        '../../../../../../../viewer-admin/src/main/webapp/resources/js/**/*.js'
                    ],
                }
            }
        ];
        languageFiles.forEach(fileConf => {
            this.createLanguageFile(fileConf);
        });
    }

    createLanguageFile(opts) {
        let store = {};
        fs.readFile(opts.outputFilename, 'utf8', (err, data) => {
            if(!err) {
                try {
                    store = JSON.parse(data);
                } catch(e) {
                    console.error(e);
                }
            }
            const count_store = this.createCountStore(store);
            this.extractText(store, count_store, opts);
        });
    }

    createCountStore(store) {
        const count_store = {};
        for(const key in store) if(store.hasOwnProperty(key)) {
            const basename = key.substring(0, key.lastIndexOf("_"));
            const count = parseInt(key.substring(key.lastIndexOf("_") + 1));
            if (!count_store.hasOwnProperty(basename) || count_store[basename] < count) {
                count_store[basename] = count + 1;
            }
        }
        return count_store;
    }

    writeFile(store, outputFilename) {
        const ordered_store = {};
        Object.keys(store).sort().forEach((key) => {
            ordered_store[key] = store[key];
        });
        const json_content = JSON.stringify(ordered_store, null, 4);
        fs.writeFile(outputFilename, json_content, (err) => {
            if(err) {
                return console.log(err);
            }
        });
    }

    getKey(count_store, filename, filecontents) {
        const classNameMatches = filecontents.match(/Ext\.define\s*\(["'](viewer\.[^'"]*)["']/);
        const className = (classNameMatches && classNameMatches.length > 1) ? classNameMatches[1] : "";
        let keyname = "";
        if (className) {
            keyname = className.replace(/[\.\-]/g, "_").toLowerCase();
        } else {
            keyname = filename.substring(filename.lastIndexOf("/") + 1).replace(/\-/g, "_").replace(".js", "").toLowerCase();
        }
        if (!count_store.hasOwnProperty(keyname)) {
            count_store[keyname] = 0;
        }
        return `${keyname}_${count_store[keyname]++}`;
    }

    extractText(store, count_store, opts) {
        let match_count = 0;
        const propReplacer = {
            ...opts.fileOptions,  
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
                const key = this.getKey(count_store, filename, filecontents);
                store[key] = text;
                match_count++;
                return match.replace(/(text|title|tooltip|fieldLabel|emptyText|boxLabel|msg|header|html):\s?['"].*/, "$1: i18next.t('" + key + "')");
            },
        };
        const msgBoxReplacer = {
            ...opts.fileOptions,
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
                    const key = this.getKey(count_store, filename, filecontents);
                    store[key] = text1;
                    replaced += "i18next.t('" + key + "')";
                } else {
                    replaced += text1;
                }
                replaced += ", ";
                if (text2) {
                    const key = this.getKey(count_store, filename, filecontents);
                    store[key] = text2;
                    replaced += "i18next.t('" + key + "')";
                }
                match_count++;
                return replaced;
            },
        };
        const loadingReplacer = {
            ...opts.fileOptions,
            from: /setLoading(["']{1}([^'"]*)["']{1})/g,
            to: (...args) => {
                const match = args[0];
                const text = args[1];
                const filecontents = args[args.length - 2];
                const filename = args[args.length - 1];
                if (!text) {
                    return match;
                }
                const key = this.getKey(count_store, filename, filecontents);
                store[key] = text;
                match_count++;
                return "setLoading(i18next.t('" + key + "'))";
            },
        };
        try {
            replace.sync(propReplacer);
            replace.sync(msgBoxReplacer);
            replace.sync(loadingReplacer);
            this.writeFile(store, opts.outputFilename);
            console.log(`Total replacements for ${path.resolve(opts.outputFilename)}: ${match_count}`);
        }
        catch(error) {
            console.error("An error occurred: ", error);
        }
    }

}

new TextExtractor();