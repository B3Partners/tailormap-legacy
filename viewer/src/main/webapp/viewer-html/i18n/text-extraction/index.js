const replace = require('replace-in-file');
const fs = require('fs');
const path = require('path');

class TextExtractor {

    constructor() {
        this.combined_stores = [];
        const languageFiles = [
            // {
            //     outputFilename: "../locales/nl.json",
            //     outputJS: "../locales/nl.js",
            //     fileOptions: {
            //         files: [
            //             '../../common/**/*.js',
            //             '../../components/**/*.js'
            //         ],
            //         ignore: [
            //             '../../common/openlayers/**/*.js'
            //         ],
            //     }
            // },
            // {
            //     outputFilename: "../../../../../../../viewer-admin/src/main/webapp/resources/i18n/locales/nl.json",
            //     outputJS: "../../../../../../../viewer-admin/src/main/webapp/resources/i18n/locales/nl.js",
            //     prefix: "viewer_admin",
            //     useCombined: true,
            //     fileOptions: {
            //         files: [
            //             '../../../../../../../viewer-admin/src/main/webapp/resources/js/**/*.js'
            //         ],
            //     }
            // },
            {
                outputFilename: "../nl_jsp.json",
                outputProperties: "../nl.properties",
                prefix: "viewer",
                seperator: ".",
                fileOptions: {
                    files: [
                        '../../../../../../../viewer/src/main/webapp/**/*.jsp'
                    ],
                }
            },
            {
                outputFilename: "../../../../../../../viewer-admin/src/main/webapp/resources/i18n/locales/nl_jsp.json",
                outputProperties: "../../../../../../../viewer-admin/src/main/webapp/resources/i18n/locales/nl.properties",
                prefix: "viewer_admin",
                seperator: ".",
                fileOptions: {
                    files: [
                        '../../../../../../../viewer-admin/src/main/webapp/**/*.jsp'
                    ],
                }
            },
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
            const count_store = this.createCountStore(store, opts.seperator || "_");
            if (opts.outputProperties) {
                this.extractTextFromJSP(store, count_store, opts);
                return;
            }
            this.extractTextFromJS(store, count_store, opts);
        });
    }

    createCountStore(store, seperator = "_") {
        const count_store = {};
        for(const key in store) if(store.hasOwnProperty(key)) {
            const basename = key.substring(0, key.lastIndexOf(seperator));
            const count = parseInt(key.substring(key.lastIndexOf(seperator) + 1)) + 1;
            if (!count_store.hasOwnProperty(basename) || count_store[basename] < count) {
                count_store[basename] = count;
            }
        }
        return count_store;
    }

    writeFile(store, outputFilename, filename) {
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
        if (filename.indexOf(".properties") !== -1) {
            this.writePropertiesFile(ordered_store, filename);
            return;
        }
        this.writeJsFile(json_content, filename);
    }

    writeJsFile(json_content, jsFilename) {
        const jsCode = `
i18next.init({
    lng: 'nl',
    fallbackLng: 'nl',
    resources: {
        nl: {
            translation: ${json_content}
        }
    }
});`;
        fs.writeFile(jsFilename, jsCode, (err) => {
            if(err) {
                return console.log(err);
            }
        });
    }

    writePropertiesFile(store, propertiesFilename) {
        const props = [];
        for(const key in store) if(store.hasOwnProperty(key)) {
            props.push(`${key}=${store[key]}`);
        }
        fs.writeFile(propertiesFilename, props.join("\n"), (err) => {
            if(err) {
                return console.log(err);
            }
        });
    }

    getKey(count_store, filename, filecontents, prefix, seperator = "_") {
        const classNameMatches = filecontents.match(/Ext\.define\s*\(["'](viewer\.[^'"]*)["']/);
        const className = (classNameMatches && classNameMatches.length > 1) ? classNameMatches[1] : "";
        let keyname = "";
        if (className) {
            keyname = className.replace(/[\.\-]/g, seperator).toLowerCase();
        } else {
            keyname = filename.substring(filename.lastIndexOf("/") + 1).replace(/\-/g, seperator).replace(".jsp", "").replace(".js", "").toLowerCase();
        }
        if (prefix) {
            keyname = prefix + seperator + keyname;
        }
        if (!count_store.hasOwnProperty(keyname)) {
            count_store[keyname] = 0;
        }
        return `${keyname}${seperator}${count_store[keyname]++}`;
    }

    extractTextFromJS(store, count_store, opts) {
        let match_count = 0;
        const propReplacer = {
            ...opts.fileOptions,  
            from: /(text|title|tooltip|fieldLabel|label|message|emptyText|boxLabel|msg|header|html):\s?(["'])(?:(?=(\\?))\3.)*?\2/g,
            to: (...args) => {
                const match = args[0];
                const filecontents = args[args.length - 2];
                const filename = args[args.length - 1];
                let text = match.replace(/(text|title|tooltip|fieldLabel|label|message|emptyText|boxLabel|msg|header|html)\s*:\s*['"]/, "");
                text = text.substring(0, text.length - 1);
                if (!text) {
                    return match;
                }
                const key = this.getKey(count_store, filename, filecontents, opts.prefix);
                store[key] = text;
                match_count++;
                return match.replace(/(text|title|tooltip|fieldLabel|label|message|emptyText|boxLabel|msg|header|html):\s?['"].*/, "$1: i18next.t('" + key + "')");
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
                    const key = this.getKey(count_store, filename, filecontents, opts.prefix);
                    store[key] = text1;
                    replaced += "i18next.t('" + key + "')";
                } else {
                    replaced += text1;
                }
                replaced += ", ";
                if (text2) {
                    const key = this.getKey(count_store, filename, filecontents, opts.prefix);
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
                const key = this.getKey(count_store, filename, filecontents, opts.prefix);
                store[key] = text;
                match_count++;
                return "setLoading(i18next.t('" + key + "'))";
            },
        };
        const i18nReplacer = {
            ...opts.fileOptions,
            from: /___\("(.*)([\),])/g,
            to: (...args) => {
                const match = args[0];
                const text = args[1];
                const delim = args[2];
                const filecontents = args[args.length - 2];
                const filename = args[args.length - 1];
                if (!text) {
                    return match;
                }
                const key = this.getKey(count_store, filename, filecontents, opts.prefix);
                store[key] = text;
                match_count++;
                return "i18next.t('" + key + "'" + delim;
            },
        };
        try {
            replace.sync(propReplacer);
            replace.sync(msgBoxReplacer);
            replace.sync(loadingReplacer);
            replace.sync(i18nReplacer);
            let output_store = store;
            if (opts.useCombined) {
                this.combined_stores.forEach(s => {
                    output_store = {
                        ...output_store,
                        ...s
                    };
                });
            }
            this.writeFile(output_store, opts.outputFilename, opts.outputJS);
            this.combined_stores.push(store);
            console.log(`Total replacements for ${path.resolve(opts.outputFilename)}: ${match_count}`);
        }
        catch(error) {
            console.error("An error occurred: ", error);
        }
    }

    extractTextFromJSP(store, count_store, opts) {
        let match_count = 0;
        const textReplacer = {
            ...opts.fileOptions,  
            from: /___([^_]*)___/g,
            to: (...args) => {
                const match = args[0];
                const text = args[1];
                const filecontents = args[args.length - 2];
                const filename = args[args.length - 1];
                if (!text) {
                    return match;
                }
                const key = this.getKey(count_store, filename, filecontents, opts.prefix, ".");
                store[key] = text;
                match_count++;
                return `<fmt:message key="${key}" />`;
            },
        }
        try {
            replace.sync(textReplacer);
            this.writeFile(store, opts.outputFilename, opts.outputProperties);
            console.log(`Total replacements for ${path.resolve(opts.outputFilename)}: ${match_count}`);
        }
        catch(error) {
            console.error("An error occurred: ", error);
        }
    }

}

new TextExtractor();