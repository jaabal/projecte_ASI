/*
 Configure RequireJS with Karma tests.
 Thanks to http://karma-runner.github.io/1.0/plus/requirejs.html
 */

var USE_ES6 = window.__env__['USE_ES6'] == 'true'
var testModules = []
var requirejsPaths = {
    'tornadowebsocket': './dist/tornadowebsocket',
    'progressbar': './dist/modules/progress_bar',
}

function isES6Module(module) {
    return /_test-es6$/.test(module)
}

// Let's found our test files
Object.keys(window.__karma__.files).sort().forEach(function (file) {
    // A test file!
    if (/_test(-es6)?\.js$/.test(file)) {
        // Normalize paths to RequireJS module names.
        // If you require sub-dependencies of test files to be loaded as-is (requiring file extension)
        // then do not normalize the paths
        var testModule = file.replace(/^\/base\/|\.js$/g, '')
        var es6TestModule = testModule + '-es6'

        // Try to find to make the following code cleaner
        if (!USE_ES6) {
            if (!isES6Module(testModule)) {
                // No ES6 mode, only load non ES6 test files
                testModules.push(testModule)
            }
        } else { // ES6 mode
            if (isES6Module(testModule)) {
                // We directly found a compatible module
                testModules.push(testModule)
            } else {
                if (testModules.indexOf(es6TestModule) === -1) {
                    testModules.push(testModule)
                }
            }
        }
    }
})

if (USE_ES6) {
    for (var path in requirejsPaths) {
        requirejsPaths[path + '-es6'] = requirejsPaths[path] + '-es6'
        delete requirejsPaths[path]
    }
}

window.__env__['dependencies'] = Object.keys(requirejsPaths)

console.log('RequireJS files: ', requirejsPaths)
console.log('Test modules: ', testModules)
console.log('Dependencies: ', window.__env__['dependencies'])

requirejs.config({
    // Karma serves files under /base, which is the basePath from your config file
    baseUrl: '/base',

    // Configure our module
    paths: requirejsPaths,

    // Ask Require.js to load these files (all our tests)
    deps: testModules,

    // Run Karma when all deps are loaded
    callback: window.__karma__.start
})
