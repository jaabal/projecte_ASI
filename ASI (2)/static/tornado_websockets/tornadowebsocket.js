'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

(function (root, factory) {
    /* istanbul ignore next */
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if ((typeof module === 'undefined' ? 'undefined' : _typeof(module)) === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.TornadoWebSocket = factory();
    }
})(undefined, function () {
    'use strict';

    /**
     * Open a WebSocket connection to a {@link https://github.com/Kocal/django-tornado-websockets|Django-tornado-websocket}
     * WebSocket application.
     *
     * @example
     * // Open a Tornado WebSocket connection to the application « echo », at the URL `ws://localhost:1337/ws/echo`
     * const tws = new TornadoWebSocket('echo', { port: 1337 })
     *
     * // Connection is correctly open
     * tws.on('open', event => {
     *     // Send the event « client_message » with data « { 'message': 'Hello World!' } »
     *     tws.emit('client_message', { 'message':  'Hello World!'})
     *
     *     // Listen the event « server_message » from the server
     *     tws.on('server_message', data => {
     *         console.log('Got a response from the server: ', data.message)
     *     })
     * })
     *
     * // When an error occurs
     * tws.on('error', event => {
     *     console.log('An error occurred: ', event)
     * })
     *
     * // The connection is closed
     * tws.on('close', event => {
     *     console.log('Connection closed: ', event)
     * })
     */

    var TornadoWebSocket = function () {

        /**
         * Initialize a new Tornado WebSocket object with given path and options.
         *
         * @param {String}  path                                            The path/name of your dtws application
         * @param {Object=} [options={}]                                    Configuration values
         * @param {Boolean} [options.auto_connect=true]                     Enable or disable auto-connection
         * @param {String}  [options.host=location.hostname or 'localhost'] Hostname used for connection
         * @param {Number}  [options.port=8000]                             Port used for connection
         * @param {Boolean} [options.secure=false]                          Use 'ws' or 'wss' protocol
         */
        function TornadoWebSocket(path) {
            var _this = this;

            var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

            _classCallCheck(this, TornadoWebSocket);

            if (path === undefined) {
                throw new ReferenceError('You must pass « path » parameter during instantiation.');
            }

            /**
             * The WebSocket instance.
             * @private
             * @type {WebSocket}
             */
            this._websocket = null;

            /**
             * Options values, merged with default options and user-defined ones.
             * @private
             * @type {Object}
             */
            this._options = _extends({}, {
                'auto_connect': true,
                'host': location.hostname || 'localhost',
                'port': 8000,
                'secure': false
            }, options);

            /**
             * Path of a django-tornado-websockets application
             * @private
             * @type {String}
             */
            this._path = path.trim();
            this._path = this._path[0] === '/' ? this._path : '/' + this._path;

            /**
             * The current URL used for the websocket connection
             * @private
             * @type {String}
             */
            this._url = this._build_url();

            /**
             * Default events for the WebSocket connection.
             * @private
             * @type {Object}
             */
            this._websocket_events = {
                'onopen': function onopen(event) {
                    console.info('TornadoWebSocket: New connection', event);
                },
                'onmessage': function onmessage(event) {
                    // Throwing locally a based-Error message in the next try/catch block saves me to write multiple
                    // times `console.warn` and `return`. Instead, I throw a based-Error message and use `console.warn`
                    // in the catch block.
                    try {
                        var data = JSON.parse(event.data);
                        var passed_event = void 0,
                            passed_data = void 0,
                            callback = void 0;

                        if ((passed_event = data.event) === void 0) {
                            throw new ReferenceError('Can not get passed event from JSON data.');
                        }

                        if ((passed_data = data.data) === void 0) {
                            throw new ReferenceError('Can not get passed data from JSON data.');
                        }

                        if ((callback = _this._user_events[passed_event]) === void 0) {
                            throw new ReferenceError('Event « ' + passed_event + ' » is not binded.');
                        }

                        callback(passed_data);
                    } catch (e) {
                        if (e instanceof SyntaxError) {
                            // JSON.parse()
                            console.warn('TornadoWebSocket: Can not parse invalid JSON.');
                        } else {
                            console.warn('TornadoWebSocket: ' + e.message);
                        }
                    }
                },
                'onerror': function onerror(event) {
                    console.error('TornadoWebSocket: Error', event);
                },
                'onclose': function onclose(event) {
                    console.info('TornadoWebSocket: Connection closed', event);
                }
            };

            /**
             * Events defined by the user
             * @private
             * @type {Object}
             */
            this._user_events = {};

            /**
             * An array of bound modules.
             * @private
             * @type {Array}
             */
            this._modules = [];

            if (this._options.auto_connect === true) {
                this.connect();
            }
        }

        /**
         * Initialize a new WebSocket connection with a Tornado WebSocket application.
         *
         * This method binds `onopen`, `onclose`, `onerror` and `onmessage` events to the websocket object.
         * The first three events can be overloaded. You can also overload the event `onmessage` too, but it's not
         * really recommended, because it's the one which handles and parses messages sent by the Tornado WebSocket
         * application.
         */


        _createClass(TornadoWebSocket, [{
            key: 'connect',
            value: function connect() {
                this._websocket = new WebSocket(this._url);

                this._websocket.onopen = this._websocket_events.onopen;
                this._websocket.onclose = this._websocket_events.onclose;
                this._websocket.onerror = this._websocket_events.onerror;
                this._websocket.onmessage = this._websocket_events.onmessage;
            }

            /**
             * Bind a {@link TornadoWebSocket.Module} module with this {@link TornadoWebSocket} instance.
             *
             * @param {TornadoWebSocket.Module}  module  The module to bind.
             */

        }, {
            key: 'bind',
            value: function bind(module) {
                if (!(module instanceof TornadoWebSocket.Module)) {
                    throw new TypeError('Parameter « module » should be an instance of TornadoWebSocket.Module.');
                }

                module._websocket = this;
                this._modules.push(module);
            }

            /**
             * A callback which is called by {@link TornadoWebSocket#on} method.
             *
             * @callback onCallback
             * @param {Object}  data  A JavaScript object which contains additional datas.
             */
            /**
             * Execute a function when the event `event` is sent by the Tornado WebSocket application.
             * The function can take a parameter which will be an object of additional datas.
             *
             * @param {String}      event     Event name
             * @param {onCallback}  callback  Function to execute when event `event` is sent by the server
             * @example
             * tws.on('an_event', _ => {
             *     // Do something...
             * })
             * @example
             * tws.on('news', news => {
             *     console.log(`Title: ${news.title}.`)
             * })
             */

        }, {
            key: 'on',
            value: function on(event, callback) {
                if (typeof callback !== 'function') {
                    throw new TypeError('You must pass a function for « callback » parameter.');
                }

                if (['open', 'message', 'close', 'error'].indexOf(event) !== -1) {
                    event = 'on' + event;
                    this._websocket[event] = this._websocket_events[event] = callback;
                } else {
                    this._user_events[event] = callback;
                }
            }

            /**
             * Emit a couple event/data to WebSocket server.
             * If `data` is not an object, it's transformed to `{message: data}` object.
             *
             * @param {String}    event  Event name
             * @param {Object|*}  data   Data to send
             * @example
             * tws.emit('my_event', {'my': 'data'})
             *
             * tws.emit('my_event', 'My message')
             * // is equivalent to
             * tws.emit('my_event', {'message': 'My message')
             */

        }, {
            key: 'emit',
            value: function emit(event) {
                var data = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

                if ((typeof data === 'undefined' ? 'undefined' : _typeof(data)) !== 'object') {
                    data = { 'message': data };
                }

                var frame = JSON.stringify({ event: event, data: data });

                this._websocket.send(frame);
            }

            /**
             * Return an URL built from options.
             * The path is auto-prefixed by "/ws".
             *
             * @private
             * @returns {String}
             */

        }, {
            key: '_build_url',
            value: function _build_url() {
                var protocol = this._options.secure ? 'wss' : 'ws';

                return protocol + '://' + this._options.host + ':' + this._options.port + '/ws' + this._path;
            }
        }]);

        return TornadoWebSocket;
    }();

    /**
     * A base class for creating a {@link TornadoWebSocket} compatible module.
     *
     * @memberOf TornadoWebSocket
     * @abstract
     * @example
     * // Create a module which extends of {@link TornadoWebSocket.Module}
     * class MyModule extends TornadoWebSocket.Module {
     *     constructor(name) {
     *         super(name + '_')
     *     }
     *
     *     // ...
     * }
     *
     * let tws = new TornadoWebSocket('path')
     * let myModule = new MyModule('foo')
     *
     * // We should bind this module to a {@link TornadoWebSocket} instance
     * tws.bind(module)
     *
     * tws.on('open', _ => {
     *     // Emit `event` event
     *     tws.emit('event')
     *
     *     // Listen `event` server event
     *     tws.on('event', _ => {})
     *
     *     // Emit `module_foo_event` event
     *     myModule.emit('event')
     *
     *     // Listen `module_foo_event` server event
     *     myModule.on('event', _ => {})
     * })
     */


    TornadoWebSocket.Module = function () {

        /**
         * @param {String}  name  The name of the module
         */
        function _class() {
            var name = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];

            _classCallCheck(this, _class);

            if (this.constructor === TornadoWebSocket.Module) {
                throw new TypeError('Abstract class « TornadoWebSocket.Module » can not be instantiated directly.');
            }

            /**
             * The name of the module prefixed by « module_ », to imitate a namespace, and prevent possible collisions.
             * @type {String}
             * @private
             */
            this._name = 'module_' + name;
        }

        /**
         * Shortcut for {@link TornadoWebSocket#on} method, but uses {@link TornadoWebSocket.Module#_name} as a
         * prefix for `event`.
         *
         * @param {String}      event     Event name prefixed by `TornadoWebSocketModule.name`.
         * @param {onCallback}  callback  Function to execute when event `event` is received.
         */


        _createClass(_class, [{
            key: 'on',
            value: function on(event, callback) {
                return this._websocket.on(this._name + event, callback);
            }

            /**
             * Shortcut for {@link TornadoWebSocket#emit} method, but uses {@link TornadoWebSocket.Module#_name} as a
             * suffix for `event`.
             *
             * @param {String}    event  Event name prefixed by {@link TornadoWebSocket.Module#name}.
             * @param {Object|*}  data   Data to send.
             */

        }, {
            key: 'emit',
            value: function emit(event) {
                var data = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

                return this._websocket.emit(this._name + event, data);
            }
        }]);

        return _class;
    }();

    return TornadoWebSocket;
});