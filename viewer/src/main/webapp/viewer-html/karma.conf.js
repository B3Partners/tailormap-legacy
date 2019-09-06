module.exports = function(config) {
    config.set({
        basePath: '',
        frameworks: ['jasmine'],

        // order based on html output from app.jsp when ?debug=true
        files: [
            'common/FlamingoErrorLogger.js',
            'i18n/i18next.11.9.0.min.js',
            '../extjs/ext-all.js',
            '../extjs/locale/locale-nl.js',
            'common/openlayers/OpenLayers.js',
            'common/overrides.js',
            'common/*.js',
            'common/ajax/**/*.js',
            'common/viewercontroller/**/*.js',
            'components/Component.js',
            'components/**/*.js',
            'spec/**/*.spec.js'
        ],

        reporters: ['progress'],
        port: 9876,
        colors: true,
        logLevel: config.LOG_INFO,
        autoWatch: true,
        browsers: ['ChromeHeadless'],
        singleRun: true,
        concurrency: Infinity
    })
};
