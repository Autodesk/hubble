// Karma configuration
// Generated on Wed Dec 13 2017 14:08:11 GMT-0600 (CST)

module.exports = function(config)
{
    config.set({

        // base path that will be used to resolve all patterns (eg. files, exclude)
        basePath: '..',


        // frameworks to use
        // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
        frameworks: ['jasmine'],

        plugins: [
            'karma-chrome-launcher',
            'karma-coverage',
            'karma-jasmine'
        ],


        // list of files / patterns to load in the browser
        // order matters!
        files: [
            'assets/js/vendor/jquery-3.2.1.min.js',
            'assets/js/vendor/d3.v4.min.js',
            'assets/js/vendor/moment-with-locales-2.21.0.min.js',
            'assets/js/vendor/moment-timezone-0.5.14-2017c.min.js',
            'assets/js/vendor/Chart-2.7.3.min.js',
            'assets/js/vendor/spin-2.3.2.min.js',
            '_test/assets/js/charts.js',
            'spec/*.js',
            {pattern: 'assets/js/git-versions.json', watched: true, served: true, included: false},
            {pattern: 'demo-data/git-versions-new.tsv', watched: true, served: true, included: false}
        ],


        // list of files to exclude
        exclude: [
        ],


        // preprocess matching files before serving them to the browser
        // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
        preprocessors: {
            '_test/assets/js/*.js': ['coverage']
        },


        // test results reporter to use
        // possible values: 'dots', 'progress'
        // available reporters: https://npmjs.org/browse/keyword/karma-reporter
        reporters: ['progress', 'coverage'],

        coverageReporter: {
            reporters: [{type: 'lcov'}, {type: 'text-summary'}]
        },

        // web server port
        port: 9876,


        // enable / disable colors in the output (reporters and logs)
        colors: true,


        // level of logging
        // possible values: config.LOG_DISABLE || config.LOG_ERROR ||
        // config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_INFO,


        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: false,


        // start these browsers
        // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
        browsers: ['ChromeHeadless'],


        // Continuous Integration mode
        // if true, Karma captures browsers, runs the tests and exits
        singleRun: true,

        // Concurrency level
        // how many browser should be started simultaneous
        concurrency: Infinity
    });
};
