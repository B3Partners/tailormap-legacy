const replace = require('replace-in-file');
const fs = require('fs');
const path = require('path');

class FindDuplicates {

    constructor() {
        const languageFiles = [
            {
                fileOptions: {
                    files: [
                        '../../common/**/*.js',
                        '../../components/**/*.js',
                        '../../../../../../../viewer-admin/src/main/webapp/resources/js/**/*.js'
                    ],
                    ignore: [
                        '../../common/openlayers/**/*.js'
                    ],
                }
            },
        ];
        languageFiles.forEach(fileConf => {
            this.findDuplicates(fileConf);
        });
    }

    findDuplicates(opts) {
        let match_count = 0;
        const found = {};
        const duplicates = {};
        const duplicatesReplaces = {
            ...opts.fileOptions,  
            from: /i18next\.t\('([a-zA-Z0-9_]*)'\)/g,
            to: (...args) => {
                const match = args[0];
                const key = args[1];
                const filecontents = args[args.length - 2];
                const filename = args[args.length - 1];
                if(found.hasOwnProperty(key)) {
                    duplicates[key] = filename;
                }
                found[key] = filename;
                return match;
            },
        };
        try {
            replace.sync(duplicatesReplaces);
            console.log("Found the following duplicate keys: ", duplicates);
        }
        catch(error) {
            console.error("An error occurred: ", error);
        }
    }

}

new FindDuplicates();