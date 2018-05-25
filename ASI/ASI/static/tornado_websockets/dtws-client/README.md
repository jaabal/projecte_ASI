# django-tornado-websockets-client

[![Build Status](https://travis-ci.org/Kocal/dtws-client.svg?branch=master)](https://travis-ci.org/Kocal/dtws-client)
[![Coverage Status](https://coveralls.io/repos/github/Kocal/dtws-client/badge.svg?branch=master)](https://coveralls.io/github/Kocal/dtws-client?branch=master)
[![npm version](https://badge.fury.io/js/django-tornado-websockets-client.svg)](https://badge.fury.io/js/django-tornado-websockets-client)

JavaScript's WebSocket wrapper for [django-tornado-websockets](https://github.com/Kocal/django-tornado-websockets) 
project, used as a submodule.

---

## Installation

```bash
$ git clone https://github.com/Kocal/dtws-client.git
$ npm i
# npm -g gulp
```

## Running examples
Even if a non-ES6 version is available, examples are made with ES6 version of the project. So please, use a modern 
browser.

```bash
python -m httpserver
```
Open your browser at <http://localhost:8000/examples> and profit.

## Running unit tests
**The unit tests use a django-tornado-websocket application hosted on my own server, so if some tests about events 
behavior are failing, it's perfectly fine!**

* Test ES6 version: `$ USE_ES6=true npm test`
* Test non-ES6 version: `$ npm test`

## How to use

### Universal Module Definition
The JavaScript class `TornadoWebSocket` and its modules are wrapped into the [UMD](https://github.com/umdjs/umd), by 
using the [returnExports.js](https://github.com/umdjs/umd/blob/master/templates/returnExports.js) template. 

That's mean that you can use [AMD](https://en.wikipedia.org/wiki/Asynchronous_module_definition), 
[CommonJS](https://en.wikipedia.org/wiki/CommonJS), or browser globals.

### Usage with [RequireJS](http://requirejs.org/)
```bash
public
├── index.html
└── js
    ├── main.js
    ├── require.js
    └── tws
        ├── modules -> ../../../dist/modules
        ├── tornadowebsocket-es6.js -> ../../../dist/tornadowebsocket-es6.js
        └── tornadowebsocket.js -> ../../../dist/tornadowebsocket.js
```

*index.html*
```html
<script src="js/require.js" data-main="js/main"></script>
```

*js/main.js*
```javascript
function main(TornadoWebSocket) {
    var tws = new TornadoWebSocket(/* ... */)
}

// To load ES6 version
require(['tws/tornadowebsocket-es6'], main)
// To load non-ES6 version
require(['tws/tornadowebsocket'], main)

```

### Usage with browser globals
```
public
├── index.html
└── js
    ├── main.js
    └── tws
        ├── modules -> ../../../dist/modules
        ├── tornadowebsocket-es6.js -> ../../../dist/tornadowebsocket-es6.js
        └── tornadowebsocket.js -> ../../../dist/tornadowebsocket.js
```

*index.html*
```html
<script src="js/tws/tornadowebsocket-es6.js"></script>
<!-- or -->
<script src="js/tws/tornadowebsocket.js"></script>
<script src="js/main.js"></script>
```

*js/main.js*
```javascript
var tws = new TornadoWebSocket(/* ... */)
```

### Using DTWS-client's Modules
As said just before, this project comes with its own modules. 

#### {@link ModuleProgressBar}
This module helps to:
- Communicate with the [Progress Bar server-side module](http://django-tornado-websockets.readthedocs.io/en/stable/modules.html#progress-bar), 
- Handle the behavior of a progress bar (`init`, `update`, `done` events),
- Render a progress bar by using HTML5 or Bootstrap rendering.

*index.html*
```html
<!-- With RequireJS -->
<script src="js/require.js" data-main="js/main"></script>

<!-- With browser globals -->
<script src="js/tws/tornadowebsocket-es6.js"></script>
<script src="js/tws/modules/progress_bar-es6.js"></script>
<script src="js/main.js"></script>
```

*js/main.js*
```javascript
function main(TornadoWebSocket, ModuleProgressBar) {
    var tws = new TornadoWebSocket(/* ... */)
    var progress = new ModuleProgressBar(/* ... */)
    
    tws.bind(progress)
}

// With RequireJS (ES6 version)
require(['tws/tornadowebsocket-es6', 'tws/modules/progress_bar-es6'], main)
// With RequireJS (non-ES6 version)
require(['tws/tornadowebsocket', 'tws/modules/progress_bar'], main)

// With browser globals
main(window.TornadoWebSocket, window.ModuleProgressBar)
```

## npm scripts

### doc
Generate the API documentation with [JSDoc](http://usejsdoc.org).

### test
Run unit tests by using [Karma](https://karma-runner.github.io) and [Jasmine](http://jasmine.github.io).

## gulp tasks

### default
Watch ES6 source files and run the `scripts` task.

### scripts
1. Glob ES6 source files,
2. Use [ESLint](http://eslint.org/) on them,
3. Distribute a ES6 version, 
4. Run [Babel](https://babeljs.io/) on them and generate a non-ES6 version.
