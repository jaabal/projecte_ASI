(function (root, factory) {
    /* istanbul ignore next */
    if (typeof define === 'function' && define.amd) {
        define([], factory)
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory()
    } else {
        root.TornadoWebSocket = factory()
    }
}(this, function () {
    'use strict'

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
    class TornadoWebSocket {

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
        constructor(path, options = {}) {
            if (path === undefined) {
                throw new ReferenceError('You must pass « path » parameter during instantiation.')
            }

            /**
             * The WebSocket instance.
             * @private
             * @type {WebSocket}
             */
            this._websocket = null

            /**
             * Options values, merged with default options and user-defined ones.
             * @private
             * @type {Object}
             */
            this._options = Object.assign({}, {
                'auto_connect': true,
                'host': location.hostname || 'localhost',
                'port': 8000,
                'secure': false,
            }, options)

            /**
             * Path of a django-tornado-websockets application
             * @private
             * @type {String}
             */
            this._path = path.trim()
            this._path = this._path[0] === '/' ? this._path : '/' + this._path

            /**
             * The current URL used for the websocket connection
             * @private
             * @type {String}
             */
            this._url = this._build_url()

            /**
             * Default events for the WebSocket connection.
             * @private
             * @type {Object}
             */
            this._websocket_events = {
                'onopen': event => {
                    console.info('TornadoWebSocket: New connection', event)
                },
                'onmessage': event => {
                    // Throwing locally a based-Error message in the next try/catch block saves me to write multiple
                    // times `console.warn` and `return`. Instead, I throw a based-Error message and use `console.warn`
                    // in the catch block.
                    try {
                        let data = JSON.parse(event.data)
                        let passed_event, passed_data, callback

                        if ((passed_event = data.event) === void 0) {
                            throw new ReferenceError('Can not get passed event from JSON data.')
                        }

                        if ((passed_data = data.data) === void 0) {
                            throw new ReferenceError('Can not get passed data from JSON data.')
                        }

                        if ((callback = this._user_events[passed_event]) === void 0) {
                            throw new ReferenceError(`Event « ${passed_event} » is not binded.`)
                        }

                        callback(passed_data)
                    } catch (e) {
                        if (e instanceof SyntaxError) {  // JSON.parse()
                            console.warn('TornadoWebSocket: Can not parse invalid JSON.')
                        } else {
                            console.warn(`TornadoWebSocket: ${e.message}`)
                        }
                    }
                },
                'onerror': event => {
                    console.error('TornadoWebSocket: Error', event)
                },
                'onclose': event => {
                    console.info('TornadoWebSocket: Connection closed', event)
                }
            }

            /**
             * Events defined by the user
             * @private
             * @type {Object}
             */
            this._user_events = {}

            /**
             * An array of bound modules.
             * @private
             * @type {Array}
             */
            this._modules = []

            if (this._options.auto_connect === true) {
                this.connect()
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
        connect() {
            this._websocket = new WebSocket(this._url)

            this._websocket.onopen = this._websocket_events.onopen
            this._websocket.onclose = this._websocket_events.onclose
            this._websocket.onerror = this._websocket_events.onerror
            this._websocket.onmessage = this._websocket_events.onmessage
        }

        /**
         * Bind a {@link TornadoWebSocket.Module} module with this {@link TornadoWebSocket} instance.
         *
         * @param {TornadoWebSocket.Module}  module  The module to bind.
         */
        bind(module) {
            if (!(module instanceof TornadoWebSocket.Module)) {
                throw new TypeError('Parameter « module » should be an instance of TornadoWebSocket.Module.')
            }

            module._websocket = this
            this._modules.push(module)
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
        on(event, callback) {
            if (typeof callback !== 'function') {
                throw new TypeError('You must pass a function for « callback » parameter.')
            }

            if (['open', 'message', 'close', 'error'].includes(event)) {
                event = 'on' + event
                this._websocket[event] = this._websocket_events[event] = callback
            } else {
                this._user_events[event] = callback
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
        emit(event, data = {}) {
            if (typeof data !== 'object') {
                data = {'message': data}
            }

            let frame = JSON.stringify({event, data})

            this._websocket.send(frame)
        }

        /**
         * Return an URL built from options.
         * The path is auto-prefixed by "/ws".
         *
         * @private
         * @returns {String}
         */
        _build_url() {
            let protocol = this._options.secure ? 'wss' : 'ws'

            return `${protocol}://${this._options.host}:${this._options.port}/ws${this._path}`
        }
    }

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
    TornadoWebSocket.Module = class {

        /**
         * @param {String}  name  The name of the module
         */
        constructor(name = '') {
            if (this.constructor === TornadoWebSocket.Module) {
                throw new TypeError('Abstract class « TornadoWebSocket.Module » can not be instantiated directly.')
            }

            /**
             * The name of the module prefixed by « module_ », to imitate a namespace, and prevent possible collisions.
             * @type {String}
             * @private
             */
            this._name = 'module_' + name
        }

        /**
         * Shortcut for {@link TornadoWebSocket#on} method, but uses {@link TornadoWebSocket.Module#_name} as a
         * prefix for `event`.
         *
         * @param {String}      event     Event name prefixed by `TornadoWebSocketModule.name`.
         * @param {onCallback}  callback  Function to execute when event `event` is received.
         */
        on(event, callback) {
            return this._websocket.on(this._name + event, callback)
        }

        /**
         * Shortcut for {@link TornadoWebSocket#emit} method, but uses {@link TornadoWebSocket.Module#_name} as a
         * suffix for `event`.
         *
         * @param {String}    event  Event name prefixed by {@link TornadoWebSocket.Module#name}.
         * @param {Object|*}  data   Data to send.
         */
        emit(event, data = {}) {
            return this._websocket.emit(this._name + event, data)
        }
    }

    return TornadoWebSocket
}))