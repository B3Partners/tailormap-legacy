const replace = require('replace-in-file');
const fs = require('fs');
const path = require('path');

class RecalculateKeys {

    constructor() {
        this.combined_stores = [];
        const languageFiles = [
            {
                outputFilename: "../locales/nl.json",
                outputJS: "../locales/nl.js",
                fileOptions: {
                    files: [
                        '../../common/**/*.js',
                        '../../components/**/*.js'
                    ],
                    ignore: [
                        '../../common/openlayers/**/*.js'
                    ],
                }
            },
            {
                outputFilename: "../../../../../../../viewer-admin/src/main/webapp/resources/i18n/locales/nl.json",
                outputJS: "../../../../../../../viewer-admin/src/main/webapp/resources/i18n/locales/nl.js",
                prefix: "viewer_admin",
                useCombined: true,
                fileOptions: {
                    files: [
                        '../../../../../../../viewer-admin/src/main/webapp/resources/js/**/*.js'
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
            this.extractTextFromJS(store, {}, opts);
        });
    }

    getKey(count_store, filename, filecontents, prefix, seperator = "_") {
        const classNameMatches = filecontents.match(/Ext\.define\s*\(["'](viewer\.[^'"]*)["']/);
        const className = (classNameMatches && classNameMatches.length > 1) ? classNameMatches[1] : "";
        let keyname = "";
        if (className && className !== "viewer.components.CustomConfiguration") {
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

    extractTextFromJS(original_store, count_store, opts) {
        let match_count = 0;
        const store = {};
        const keyReplacer = {
            ...opts.fileOptions,  
            from: /i18next\.t\('([a-zA-Z0-9_]*)'/g,
            to: (...args) => {
                const match = args[0];
                const key = args[1];
                const filecontents = args[args.length - 2];
                const filename = args[args.length - 1];
                const new_key = this.getKey(count_store, filename, filecontents, opts.prefix);
                store[new_key] = original_store[key];
                match_count++;
                return `i18next.t('${new_key}'`;
            },
        };
        try {
            replace.sync(keyReplacer);
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

}

new RecalculateKeys();