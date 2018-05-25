// Karma configuration
// Generated on Mon May 16 2016 20:25:41 GMT+0200 (CEST)

module.exports = function (config) {
    var configuration = {

        // base path that will be used to resolve all patterns (eg. files, exclude)
        basePath: '',

        // frameworks to use
        // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
        frameworks: ['jasmine', 'requirejs'],

        // list of files / patterns to load in the browser
        files: [
            {pattern: 'dist/**/*.js', included: false},
            {pattern: 'tests/*_test-es6.js', included: false},
            {pattern: 'tests/*_test.js', included: false},
            'tests/test-main.js'
        ],

        // list of files to exclude
        exclude: [],

        // test results reporter to use
        // possible values: 'dots', 'progress'
        // available reporters: https://npmjs.org/browse/keyword/karma-reporter
        reporters: ['mocha', 'coverage'],

        // preprocess matching files before serving them to the browser
        // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
        preprocessors: {
            'dist/**/*.js': ['coverage'],
            '**/*.js': ['env'], // Pass environment variables to our JS files
        },

        // web server port
        port: 9876,

        // enable / disable colors in the output (reporters and logs)
        colors: true,

        // level of logging
        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_INFO,

        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: false,

        // start these browsers
        // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
        browsers: [],

        customLaunchers: {},

        // Continuous Integration mode
        // if true, Karma captures browsers, runs the tests and exits
        singleRun: true,

        // Concurrency level
        // how many browser should be started simultaneous
        concurrency: Infinity,

        client: {
            captureConsole: false
        },

        // Pass USE_ES6 env. variable
        envPreprocessor: [
            'USE_ES6',
        ]
    }

    // --- Browser configuration
    if (process.env.TRAVIS) {
        // Run tests on Firefox/Chrome/Opera one by one
        var browser = process.env.BROWSER

        if (browser == 'Chrome') {
            configuration.customLaunchers['Chrome_travis_ci'] = {
                base: 'Chrome',
                flags: ['--no-sandbox']
            }

            browser = 'Chrome_travis_ci'
        }

        configuration.browsers.push(browser)
    } else {
        // On my computers, just run tests on all browsers I have
        configuration.browsers.push('Chrome', 'Firefox', 'Opera')
    }

    console.log('Run tests on: ' + configuration.browsers.join(', '))

    // --- Coverage configuration
    if (process.env.TRAVIS) {
        console.log('Send coverage files to Coveralls')
        configuration.reporters.push('coveralls')
        configuration.coverageReporter = {
            type: 'lcov',
            dir: 'coverage'
        }
    } else {
        console.log('Save coverage files in local')
        configuration.coverageReporter = {
            type: 'html',
            dir: 'coverage'
        }
    }

    config.set(configuration)
}
